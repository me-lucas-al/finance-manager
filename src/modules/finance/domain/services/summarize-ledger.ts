import { shiftMonth } from '@/lib/month';
import type { LedgerEntry, LedgerKind } from '../models/ledger-entry';

export type LedgerTotals = {
  income: number;
  expenses: number;
  investments: number;
  balance: number;
};

export type MonthlyEvolution = LedgerTotals & {
  month: string;
  cumulativeBalance: number;
};

export type CategoryTotal = { category: string; total: number };

const roundCents = (value: number): number => Math.round(value * 100) / 100;

export function monthOf(entry: LedgerEntry): string {
  return entry.date.slice(0, 7);
}

export function entriesInMonth(entries: LedgerEntry[], month: string): LedgerEntry[] {
  return entries.filter((entry) => monthOf(entry) === month);
}

export function entriesOfKind(entries: LedgerEntry[], kind: LedgerKind): LedgerEntry[] {
  return entries.filter((entry) => entry.kind === kind);
}

function sumOfKind(entries: LedgerEntry[], kind: LedgerKind): number {
  return entriesOfKind(entries, kind).reduce((sum, entry) => sum + entry.amount, 0);
}

export function totalsOf(entries: LedgerEntry[]): LedgerTotals {
  const income = sumOfKind(entries, 'income');
  const expenses = sumOfKind(entries, 'expense');
  const investments = sumOfKind(entries, 'investment');
  return {
    income: roundCents(income),
    expenses: roundCents(expenses),
    investments: roundCents(investments),
    balance: roundCents(income - expenses - investments),
  };
}

export function balanceThrough(entries: LedgerEntry[], month: string): number {
  return totalsOf(entries.filter((entry) => monthOf(entry) <= month)).balance;
}

export function monthlyEvolution(entries: LedgerEntry[], lastMonth: string, monthCount: number): MonthlyEvolution[] {
  const months = Array.from({ length: monthCount }, (_, index) => shiftMonth(lastMonth, index - (monthCount - 1)));
  return months.map((month) => ({
    month,
    ...totalsOf(entriesInMonth(entries, month)),
    cumulativeBalance: balanceThrough(entries, month),
  }));
}

export function totalsByCategory(entries: LedgerEntry[], kind: LedgerKind): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const entry of entriesOfKind(entries, kind)) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount);
  }
  return Array.from(totals, ([category, total]) => ({ category, total: roundCents(total) })).sort(
    (a, b) => b.total - a.total
  );
}

export const EMPTY_TOTALS: LedgerTotals = Object.freeze({ income: 0, expenses: 0, investments: 0, balance: 0 });
