import { describe, expect, it } from "vitest";
import { getDataset } from "./data-source";
import { applyFilters, availableCash, cardDebt, formatUSD, latest, respond, spendingByCategory, summarize, patterns } from "./engine";
import type { Filters } from "./types";

const ds = getDataset();
const all: Filters = { period: "all", accountId: "all", category: "all" };

describe("Finança Clara engine", () => {
  it("available cash sums only deposit accounts = US$ 300,00", () => {
    expect(availableCash(ds)).toBe(300);
    expect(formatUSD(availableCash(ds))).toBe("US$ 300,00");
  });
  it("card debt = US$ 5.430,00", () => expect(formatUSD(cardDebt(ds))).toBe("US$ 5.430,00"));
  it("null shows Não informado", () => expect(formatUSD(null)).toBe("Não informado"));
  it("22 records, 20 confirmed, 2 pending", () => {
    const s = summarize(applyFilters(ds, all));
    expect([s.total, s.confirmed, s.pending.length]).toEqual([22, 20, 2]);
  });
  it("sign convention: positive = outflow, negative = inflow; pending excluded", () => {
    const s = summarize(applyFilters(ds, all));
    expect(s.inflows).toBe(1830);
    expect(s.outflows).toBe(822.04);
    expect(s.consumption).toBe(557.04);
  });
  it("food spending excludes pending", () => {
    expect(spendingByCategory(ds.transactions).find((c) => c.category === "Alimentação")?.total).toBe(229.75);
  });
  it("combined filter: 30 days + checking + Transporte", () => {
    const t = applyFilters(ds, { period: "30", accountId: "checking", category: "Transporte" });
    expect(t.map((x) => x.id)).toEqual(["tx02", "tx12", "tx15"]);
  });
  it("7-day window relative to 2026-09-25", () => {
    expect(applyFilters(ds, { ...all, period: "7" }).map((x) => x.id).sort()).toEqual(["tx01", "tx02", "tx03", "tx04", "tx05", "tx21", "tx22"]);
  });
  it("latest returns 5 by date desc, or fewer", () => {
    expect(latest(ds.transactions).map((t) => t.date)).toEqual(["2026-09-25", "2026-09-25", "2026-09-24", "2026-09-23", "2026-09-22"]);
    expect(latest(ds.transactions.slice(0, 2))).toHaveLength(2);
  });
  it("empty set is reported, not invented", () => {
    const r = respond("Ver minhas últimas transações", ds, { period: "7", accountId: "business", category: "all" });
    expect(r.analyzed).toBe(0);
    expect(JSON.stringify(r.blocks)).toContain("Não há transações");
  });
  it("write operations are refused", () => {
    for (const q of ["Fazer um Pix de 50", "transferir 100 para poupança", "pagar a fatura"]) {
      expect(JSON.stringify(respond(q, ds, all).blocks)).toContain("Não consigo realizar");
    }
  });
  it("unsupported questions explain the limit", () => {
    expect(JSON.stringify(respond("Qual a cotação do real?", ds, all).blocks)).toContain("fora do que posso");
  });
  it("patterns: at most three, includes Uber repetition", () => {
    const p = patterns(ds.transactions);
    expect(p.length).toBeLessThanOrEqual(3);
    expect(p.join(" ")).toContain('"Uber" aparece 4 vezes');
  });
});
