import type { Account, Block, Dataset, Filters, Reply, Transaction } from "./types";

export const NON_CONSUMPTION = ["Transferências", "Pagamento de dívidas"];
export const SUGGESTIONS = [
  "Mostrar minhas contas",
  "Consultar meus saldos",
  "Ver minhas últimas transações",
  "Quanto gastei com alimentação?",
  "Resumir minhas movimentações",
  "Quais são os três padrões de gasto?",
];

const nf = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function formatUSD(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "Não informado";
  return `${v < 0 ? "-" : ""}US$ ${nf.format(Math.abs(v))}`;
}
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
const round = (n: number) => Math.round(n * 100) / 100;
const sum = (xs: number[]) => round(xs.reduce((a, b) => a + b, 0));

export function availableCash(ds: Dataset): number {
  return sum(ds.accounts.filter((a) => a.kind === "asset").map((a) => a.available ?? 0));
}
export function cardDebt(ds: Dataset): number {
  return sum(ds.accounts.filter((a) => a.kind === "liability").map((a) => a.current ?? 0));
}
export const isOutflow = (t: Transaction) => t.amount > 0;
export const isInflow = (t: Transaction) => t.amount < 0;

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
}
export function applyFilters(ds: Dataset, f: Filters): Transaction[] {
  return ds.transactions.filter((t) => {
    if (f.period !== "all") {
      const diff = daysBetween(t.date, ds.snapshotDate);
      if (diff < 0 || diff >= Number(f.period)) return false;
    }
    if (f.accountId !== "all" && t.accountId !== f.accountId) return false;
    if (f.category !== "all" && t.category !== f.category) return false;
    return true;
  });
}
export function summarize(txs: Transaction[]) {
  const confirmed = txs.filter((t) => !t.pending);
  const pending = txs.filter((t) => t.pending);
  const outflows = sum(confirmed.filter(isOutflow).map((t) => t.amount));
  const inflows = sum(confirmed.filter(isInflow).map((t) => -t.amount));
  const consumption = sum(
    confirmed.filter((t) => isOutflow(t) && !NON_CONSUMPTION.includes(t.category)).map((t) => t.amount),
  );
  return { total: txs.length, confirmed: confirmed.length, pending, outflows, inflows, consumption };
}
export function spendingByCategory(txs: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of txs) if (!t.pending && isOutflow(t)) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  return [...map.entries()].map(([category, total]) => ({ category, total: round(total) })).sort((a, b) => b.total - a.total);
}
export function latest(txs: Transaction[], n = 5) {
  return [...txs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1)).slice(0, n);
}
export function patterns(txs: Transaction[]): string[] {
  const out: string[] = [];
  const cats = spendingByCategory(txs).filter((c) => !NON_CONSUMPTION.includes(c.category));
  const top = cats.slice(0, 2);
  for (const c of top) {
    const n = txs.filter((t) => !t.pending && isOutflow(t) && t.category === c.category).length;
    out.push(`${c.category} soma ${formatUSD(c.total)} em ${n} saída(s) confirmada(s) no recorte.`);
  }
  const ubers = txs.filter((t) => !t.pending && isOutflow(t) && t.name === "Uber");
  if (ubers.length >= 2) {
    out.push(`"Uber" aparece ${ubers.length} vezes (${ubers.map((u) => formatDate(u.date)).join(", ")}), total ${formatUSD(sum(ubers.map((u) => u.amount)))}.`);
  } else if (cats[2]) {
    out.push(`${cats[2].category} soma ${formatUSD(cats[2].total)} no recorte.`);
  }
  return out.slice(0, 3);
}

export function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
const WRITE = /\b(pix|transfer(ir|e|a)|pagar|pague|pagamento de|enviar dinheiro|depositar|sacar|saque|contratar|emprestimo|investir|aplicar|resgatar)\b/;
const UNSUPPORTED = /\b(cambio|cotacao|converter|real|reais|brl|previs\w*|investimentos?|acao|acoes|bitcoin|cripto\w*)\b/;

export type Intent = "write" | "unsupported" | "accounts" | "balances" | "latest" | "category" | "summary" | "patterns" | "pending" | "help" | "unknown";
export function detectIntent(input: string, ds: Dataset): { intent: Intent; category?: string } {
  const q = normalize(input);
  if (/^(quero |pode |faca |fazer )?(um |uma )?(pix|transferir|pagar|pague)/.test(q) || (WRITE.test(q) && !/(quanto|gastei|mostrar|ver|consultar)/.test(q))) return { intent: "write" };
  if (UNSUPPORTED.test(q)) return { intent: "unsupported" };
  const cats = [...new Set(ds.transactions.map((t) => t.category))];
  const cat = cats.find((c) => q.includes(normalize(c).slice(0, 6)));
  if (/padr/.test(q)) return { intent: "patterns" };
  if (/pendent/.test(q)) return { intent: "pending" };
  if (/(ultim|recent)/.test(q)) return { intent: "latest" };
  if (/(gast|categori|consumo)/.test(q)) return cat ? { intent: "category", category: cat } : { intent: "category" };
  if (/(resum|moviment|entrada|saida)/.test(q)) return { intent: "summary" };
  if (/(saldo|divida|limite|disponivel)/.test(q)) return { intent: "balances" };
  if (/(conta|cartao|cartoes)/.test(q)) return { intent: "accounts" };
  if (/(transac|extrato)/.test(q)) return { intent: "latest" };
  if (/(ajuda|oi|ola|o que voce)/.test(q)) return { intent: "help" };
  return { intent: "unknown" };
}

const accName = (ds: Dataset, id: string) => ds.accounts.find((a) => a.id === id)?.name ?? "Não informado";
function filterLabel(ds: Dataset, f: Filters) {
  const p = f.period === "all" ? "toda a amostra" : `últimos ${f.period} dias até ${formatDate(ds.snapshotDate)}`;
  const a = f.accountId === "all" ? "todas as contas" : accName(ds, f.accountId);
  const c = f.category === "all" ? "todas as categorias" : f.category;
  return `Recorte: ${p} · ${a} · ${c}`;
}
function footnote(ds: Dataset) {
  return `Dados fictícios · referência ${formatDate(ds.snapshotDate)} · sem conexão bancária`;
}
function accountRow(a: Account) {
  return [a.name, a.type, a.kind === "asset" ? "Depósito" : "Dívida (cartão)", formatUSD(a.current), a.kind === "asset" ? formatUSD(a.available) : `${formatUSD(a.available)} (limite)`];
}
const emptyBlock: Block = { type: "text", text: "Não há transações no recorte selecionado. Ajuste os filtros de período, conta ou categoria para ampliar a análise." };

export function respond(input: string, ds: Dataset, f: Filters): Reply {
  const fn = footnote(ds);
  const text = input.trim();
  if (!text) return { blocks: [{ type: "text", text: "Digite uma pergunta para continuar." }], footnote: fn };
  const { intent, category } = detectIntent(text, ds);
  const txs = applyFilters(ds, f);
  const label: Block = { type: "text", text: `${filterLabel(ds, f)} · ${txs.length} registro(s) analisado(s).` };

  switch (intent) {
    case "write":
      return { footnote: fn, blocks: [
        { type: "text", text: "Não consigo realizar pagamentos, Pix, transferências, contratações nem qualquer movimentação de dinheiro. Esta demonstração é somente leitura e não está conectada a nenhum banco." },
        { type: "suggestions", items: SUGGESTIONS.slice(0, 3) },
      ] };
    case "unsupported":
      return { footnote: fn, blocks: [
        { type: "text", text: "Essa pergunta está fora do que posso responder. Não tenho taxa de câmbio, previsões de investimento nem dados bancários reais — apenas uma amostra fictícia local em USD." },
        { type: "suggestions", items: SUGGESTIONS },
      ] };
    case "accounts":
      return { footnote: fn, blocks: [
        { type: "text", text: `Encontrei ${ds.accounts.length} contas fictícias. Em cartões, o saldo atual é dívida e o "disponível" é limite de crédito, não dinheiro em conta.` },
        { type: "table", caption: "Contas da amostra", columns: ["Conta", "Tipo", "Natureza", "Saldo atual", "Disponível"], rows: ds.accounts.map(accountRow) },
      ] };
    case "balances":
      return { footnote: fn, blocks: [
        { type: "metrics", items: [
          { label: "Dinheiro disponível (contas de depósito)", value: formatUSD(availableCash(ds)), hint: "Soma do disponível em conta corrente e poupança" },
          { label: "Dívidas em cartões", value: formatUSD(cardDebt(ds)), hint: "Saldo atual dos cartões" },
        ] },
        { type: "table", caption: "Saldos por conta", columns: ["Conta", "Tipo", "Natureza", "Saldo atual", "Disponível"], rows: ds.accounts.map(accountRow) },
      ] };
    case "pending": {
      const p = txs.filter((t) => t.pending);
      if (!p.length) return { footnote: fn, analyzed: txs.length, blocks: [label, { type: "text", text: "Nenhuma transação pendente no recorte." }] };
      return { footnote: fn, analyzed: txs.length, blocks: [label,
        { type: "text", text: `${p.length} transação(ões) pendente(s) — ficam fora dos totais confirmados.` },
        { type: "table", caption: "Pendências", columns: ["Data", "Descrição", "Conta", "Valor", "Estado"], rows: p.map(txRow(ds)) }] };
    }
    case "latest": {
      if (!txs.length) return { footnote: fn, analyzed: 0, blocks: [label, emptyBlock] };
      const l = latest(txs);
      return { footnote: fn, analyzed: txs.length, blocks: [label,
        { type: "text", text: l.length < 5 ? `Há apenas ${l.length} transação(ões) no recorte:` : "As cinco transações mais recentes:" },
        { type: "table", caption: "Transações mais recentes", columns: ["Data", "Descrição", "Conta", "Valor", "Estado"], rows: l.map(txRow(ds)) }] };
    }
    case "category": {
      const scoped = category ? txs.filter((t) => t.category === category) : txs;
      const lbl: Block = { type: "text", text: `${filterLabel(ds, { ...f, category: category ?? f.category })} · ${scoped.length} registro(s) analisado(s).` };
      if (!scoped.length) return { footnote: fn, analyzed: 0, blocks: [lbl, emptyBlock] };
      const groups = spendingByCategory(scoped);
      if (category) {
        const total = groups.find((g) => g.category === category)?.total ?? 0;
        const pend = scoped.filter((t) => t.pending && isOutflow(t));
        return { footnote: fn, analyzed: scoped.length, blocks: [lbl,
          { type: "metrics", items: [{ label: `Saídas confirmadas em ${category}`, value: formatUSD(total) }, ...(pend.length ? [{ label: "Pendente (fora do total)", value: formatUSD(sum(pend.map((t) => t.amount))) }] : [])] },
          { type: "table", caption: `Transações de ${category}`, columns: ["Data", "Descrição", "Conta", "Valor", "Estado"], rows: latest(scoped, 100).map(txRow(ds)) }] };
      }
      if (!groups.length) return { footnote: fn, analyzed: scoped.length, blocks: [lbl, { type: "text", text: "Não há saídas confirmadas no recorte." }] };
      return { footnote: fn, analyzed: scoped.length, blocks: [lbl,
        { type: "bars", caption: "Saídas confirmadas por categoria", items: groups.map((g) => ({ label: g.category, value: g.total, display: formatUSD(g.total) })) },
        { type: "text", text: "Transferências e Pagamento de dívidas aparecem como saídas, mas não contam como consumo." }] };
    }
    case "summary": {
      if (!txs.length) return { footnote: fn, analyzed: 0, blocks: [label, emptyBlock] };
      const s = summarize(txs);
      return { footnote: fn, analyzed: txs.length, blocks: [label,
        { type: "metrics", items: [
          { label: "Registros", value: String(s.total), hint: `${s.confirmed} confirmados · ${s.pending.length} pendentes` },
          { label: "Saídas confirmadas", value: formatUSD(s.outflows) },
          { label: "Entradas confirmadas", value: formatUSD(s.inflows) },
          { label: "Consumo", value: formatUSD(s.consumption), hint: "Exclui Transferências e Pagamento de dívidas" },
        ] },
        ...(s.pending.length ? [{ type: "table", caption: "Pendentes (fora dos totais)", columns: ["Data", "Descrição", "Conta", "Valor", "Estado"], rows: s.pending.map(txRow(ds)) } as Block] : []),
      ] };
    }
    case "patterns": {
      if (!txs.length) return { footnote: fn, analyzed: 0, blocks: [label, emptyBlock] };
      const p = patterns(txs);
      return { footnote: fn, analyzed: txs.length, blocks: [label,
        { type: "text", text: p.length ? `Observações calculadas no recorte (não representam hábitos reais):\n${p.map((x, i) => `${i + 1}. ${x}`).join("\n")}` : "Não há saídas confirmadas suficientes para observar padrões." }] };
    }
    case "help":
    case "unknown":
    default:
      return { footnote: fn, blocks: [
        { type: "text", text: intent === "help" ? "Olá! Posso consultar contas, saldos, dívidas, limites e transações desta amostra fictícia. Experimente:" : "Não entendi essa pergunta. Posso responder sobre contas, saldos, transações, categorias de gasto, resumo e padrões. Experimente:" },
        { type: "suggestions", items: SUGGESTIONS },
      ] };
  }
}
function txRow(ds: Dataset) {
  return (t: Transaction) => [formatDate(t.date), t.name, accName(ds, t.accountId), `${isOutflow(t) ? "Saída" : "Entrada"} ${formatUSD(Math.abs(t.amount))}`, t.pending ? "Pendente" : "Confirmada"];
}
