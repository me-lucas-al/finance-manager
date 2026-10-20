import type { LedgerEntry, LedgerKind } from '../domain/models/ledger-entry';
import type { CategoryTotal, LedgerTotals } from '../domain/services/summarize-ledger';

export type KindTotalRow = { kind: LedgerKind; total: number };
export type CategoryTotalRow = { category: string; total: number };

export type LedgerEntryRow = {
  id: string;
  kind: LedgerKind;
  date: string;
  description: string;
  category: string;
  amount: number;
  source: string;
};

const roundCents = (value: number): number => Math.round(value * 100) / 100;

export function toLedgerTotals(rows: KindTotalRow[]): LedgerTotals {
  const totalOf = (kind: LedgerKind) => roundCents(rows.find((row) => row.kind === kind)?.total ?? 0);
  const income = totalOf('income');
  const expenses = totalOf('expense');
  const investments = totalOf('investment');
  return { income, expenses, investments, balance: roundCents(income - expenses - investments) };
}

export const toCategoryTotals = (rows: CategoryTotalRow[]): CategoryTotal[] =>
  rows.map(({ category, total }) => ({ category, total: roundCents(total) }));

export function toLedgerEntry(row: LedgerEntryRow): LedgerEntry {
  const imported = row.source !== 'manual';
  return {
    id: row.id,
    kind: row.kind,
    date: row.date,
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    account: imported ? 'Pluggy' : 'Manual',
    ...(imported && { imported: true as const }),
    fixed: false,
  };
}
