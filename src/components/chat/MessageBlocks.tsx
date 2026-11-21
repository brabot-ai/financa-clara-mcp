import type { Block } from "@/lib/finance/types";

export function MessageBlocks({ blocks, onSuggest }: { blocks: Block[]; onSuggest: (s: string) => void }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.type === "text") return <p key={i} className="whitespace-pre-line leading-relaxed">{b.text}</p>;
        if (b.type === "metrics")
          return (
            <dl key={i} className="grid gap-2 sm:grid-cols-2">
              {b.items.map((m) => (
                <div key={m.label} className="rounded-lg border border-border bg-background p-3">
                  <dt className="text-xs text-muted-foreground">{m.label}</dt>
                  <dd className="text-lg font-semibold text-primary">{m.value}</dd>
                  {m.hint && <dd className="text-xs text-muted-foreground">{m.hint}</dd>}
                </div>
              ))}
            </dl>
          );
        if (b.type === "table")
          return (
            <div key={i} className="overflow-x-auto rounded-lg border border-border" tabIndex={0} role="region" aria-label={b.caption}>
              <table className="w-full min-w-[560px] text-sm">
                <caption className="sr-only">{b.caption}</caption>
                <thead className="bg-secondary text-left text-secondary-foreground">
                  <tr>{b.columns.map((c) => <th key={c} scope="col" className="px-3 py-2 font-medium">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {b.rows.map((r, ri) => (
                    <tr key={ri} className="border-t border-border bg-background">
                      {r.map((c, ci) => <td key={ci} className="px-3 py-2 align-top">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        if (b.type === "bars") {
          const max = Math.max(...b.items.map((x) => x.value), 1);
          return (
            <figure key={i} className="rounded-lg border border-border bg-background p-3">
              <figcaption className="mb-2 text-xs font-medium text-muted-foreground">{b.caption}</figcaption>
              <ul className="space-y-2">
                {b.items.map((x) => (
                  <li key={x.label} className="text-sm">
                    <div className="flex justify-between gap-2"><span>{x.label}</span><span className="font-medium">{x.display}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-secondary" aria-hidden="true">
                      <div className="h-2 rounded-full bg-accent-strong" style={{ width: `${(x.value / max) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </figure>
          );
        }
        return (
          <div key={i} className="flex flex-wrap gap-2">
            {b.items.map((s) => (
              <button key={s} type="button" onClick={() => onSuggest(s)}
                className="rounded-full border border-accent-strong/40 bg-background px-3 py-1.5 text-sm text-accent-strong hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {s}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
