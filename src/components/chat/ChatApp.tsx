import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Menu, Plus, Send, X, MessageSquare, Loader2 } from "lucide-react";
import { getDataset } from "@/lib/finance/data-source";
import { SUGGESTIONS, availableCash, cardDebt, formatDate, formatUSD, respond } from "@/lib/finance/engine";
import type { Filters, Period, Reply } from "@/lib/finance/types";
import { MessageBlocks } from "./MessageBlocks";

type Msg = { id: string; role: "user" | "assistant"; text?: string; reply?: Reply; error?: string };
type Conversation = { id: string; title: string; messages: Msg[] };

const ds = getDataset();
const newConv = (): Conversation => ({ id: crypto.randomUUID(), title: "Nova conversa", messages: [] });
const categories = [...new Set(ds.transactions.map((t) => t.category))].sort();

export function ChatApp() {
  const [convs, setConvs] = useState<Conversation[]>(() => [{ id: "c0", title: "Nova conversa", messages: [] }]);
  const [activeId, setActiveId] = useState("c0");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [filters, setFilters] = useState<Filters>({ period: "all", accountId: "all", category: "all" });
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const active = convs.find((c) => c.id === activeId) ?? convs[0]!;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [active.messages.length, busy]);

  const kpis = useMemo(() => ({
    cash: formatUSD(availableCash(ds)),
    debt: formatUSD(cardDebt(ds)),
    count: ds.transactions.length,
    pending: ds.transactions.filter((t) => t.pending).length,
  }), []);

  function update(id: string, fn: (c: Conversation) => Conversation) {
    setConvs((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  }

  function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    const convId = active.id;
    const f = filters;
    update(convId, (c) => ({
      ...c,
      title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
      messages: [...c.messages, { id: crypto.randomUUID(), role: "user", text }],
    }));
    setInput("");
    setBusy(true);
    setTimeout(() => {
      let msg: Msg;
      try {
        msg = { id: crypto.randomUUID(), role: "assistant", reply: respond(text, ds, f) };
      } catch {
        msg = { id: crypto.randomUUID(), role: "assistant", error: "Não consegui processar essa pergunta localmente. Tente novamente ou reformule." };
      }
      update(convId, (c) => ({ ...c, messages: [...c.messages, msg] }));
      setBusy(false);
      inputRef.current?.focus();
    }, 350);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }
  function startNew() {
    const c = newConv();
    setConvs((cs) => [c, ...cs]);
    setActiveId(c.id);
    setSidebar(false);
    inputRef.current?.focus();
  }

  const select = "min-w-0 flex-1 sm:flex-none rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex h-dvh bg-muted text-foreground">
      {sidebar && <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setSidebar(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"}`} aria-label="Conversas">
        <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary font-display text-lg font-bold text-sidebar-primary-foreground" aria-hidden="true">F+</div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold leading-tight">Finança Clara</p>
            <p className="text-xs text-sidebar-foreground/70">Assistente financeiro / dados locais</p>
          </div>
          <button className="md:hidden" aria-label="Fechar menu" onClick={() => setSidebar(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-3">
          <button onClick={startNew} className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2 text-sm font-medium text-sidebar-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <Plus className="h-4 w-4" /> Nova conversa
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Histórico da sessão">
          <p className="px-2 pb-2 text-xs uppercase tracking-wide text-sidebar-foreground/60">Histórico desta sessão</p>
          <ul className="space-y-1">
            {convs.map((c) => (
              <li key={c.id}>
                <button onClick={() => { setActiveId(c.id); setSidebar(false); }} aria-current={c.id === active.id ? "page" : undefined}
                  className={`flex w-full items-center gap-2 truncate rounded-md px-2 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${c.id === active.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"}`}>
                  <MessageSquare className="h-4 w-4 shrink-0" /><span className="truncate">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <p className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/70">Somente leitura. Sem Pix, pagamentos ou transferências. Histórico mantido apenas em memória.</p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-background">
          <div className="flex items-center gap-3 px-4 py-2">
            <button className="md:hidden" aria-label="Abrir menu" onClick={() => setSidebar(true)}><Menu className="h-5 w-5" /></button>
            <div className="min-w-0">
              <p className="inline-block rounded bg-warning px-2 py-0.5 text-xs font-bold tracking-wide text-warning-foreground" role="note">DEMONSTRAÇÃO · DADOS FICTÍCIOS</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Dados locais sintéticos · referência {formatDate(ds.snapshotDate)} · sem conexão bancária ou atualização em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-sm" role="group" aria-label="Filtros de transações">
            <span className="hidden text-xs text-muted-foreground sm:inline">Filtros:</span>
            <select aria-label="Período" className={select} value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value as Period })}>
              <option value="all">Toda a amostra</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="60">Últimos 60 dias</option>
            </select>
            <select aria-label="Conta" className={select} value={filters.accountId} onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}>
              <option value="all">Todas as contas</option>
              {ds.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select aria-label="Categoria" className={select} value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="all">Todas as categorias</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            {active.messages.length === 0 && (
              <section aria-label="Visão geral" className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Kpi label="Disponível em contas de depósito" value={kpis.cash} />
                  <Kpi label="Dívidas em cartões" value={kpis.debt} />
                  <Kpi label="Movimentações fictícias" value={String(kpis.count)} hint={`${kpis.count - kpis.pending} confirmadas · ${kpis.pending} pendentes`} />
                </div>
                <div className="rounded-xl bg-background p-4 shadow-sm">
                  <p className="font-display text-lg font-semibold text-primary">Olá! Sou a Finança Clara.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Pergunte sobre contas, saldos, dívidas, limites e transações desta amostra fictícia (valores em USD). Não realizo movimentações de dinheiro.</p>
                  <div className="mt-3"><MessageBlocks blocks={[{ type: "suggestions", items: SUGGESTIONS }]} onSuggest={send} /></div>
                </div>
              </section>
            )}
            <ol className="space-y-4" aria-live="polite" aria-label="Mensagens">
              {active.messages.map((m) => (
                <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  {m.role === "user" ? (
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">
                      <span className="sr-only">Você: </span>{m.text}
                    </div>
                  ) : (
                    <div className="w-full max-w-[95%] rounded-2xl rounded-bl-sm bg-background p-4 shadow-sm">
                      <span className="sr-only">Finança Clara: </span>
                      {m.error ? <p role="alert" className="text-destructive">{m.error}</p> : m.reply && (
                        <>
                          <MessageBlocks blocks={m.reply.blocks} onSuggest={send} />
                          <p className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">{m.reply.footnote}</p>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
            {busy && <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Processando localmente…</p>}
            <div ref={endRef} />
          </div>
        </div>

        <form className="border-t border-border bg-background p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <label htmlFor="msg" className="sr-only">Mensagem</label>
            <textarea id="msg" ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Pergunte sobre suas contas fictícias…" aria-describedby="msg-hint"
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <button type="submit" disabled={!input.trim() || busy} aria-label="Enviar mensagem"
              className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p id="msg-hint" className="mx-auto mt-1 max-w-3xl text-xs text-muted-foreground">Enter envia · Shift+Enter nova linha · respostas geradas por regras locais</p>
        </form>
      </main>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-semibold text-primary">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
