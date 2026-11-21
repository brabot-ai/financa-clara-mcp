export type Account = {
  id: string; name: string; type: string; kind: "asset" | "liability";
  current: number | null; available: number | null; currency: string;
};
export type Transaction = {
  id: string; date: string; name: string; amount: number;
  accountId: string; category: string; pending: boolean;
};
export type Dataset = { snapshotDate: string; accounts: Account[]; transactions: Transaction[] };
export type Period = "all" | "7" | "30" | "60";
export type Filters = { period: Period; accountId: string | "all"; category: string | "all" };
export type Block =
  | { type: "text"; text: string }
  | { type: "metrics"; items: { label: string; value: string; hint?: string }[] }
  | { type: "table"; caption: string; columns: string[]; rows: string[][] }
  | { type: "bars"; caption: string; items: { label: string; value: number; display: string }[] }
  | { type: "suggestions"; items: string[] };
export type Reply = { blocks: Block[]; footnote: string; analyzed?: number };
