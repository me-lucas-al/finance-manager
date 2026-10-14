import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { entriesInMonth, totalsOf } from '@/modules/finance/domain/services/summarize-ledger';

export const ALL_PERIODS = 'all';

export function entriesInPeriod(entries: LedgerEntry[], period: string): LedgerEntry[] {
  return period === ALL_PERIODS ? entries : entriesInMonth(entries, period);
}

export function percentOf(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function investmentPercentageOf(entries: LedgerEntry[]): number {
  const totals = totalsOf(entries);
  return percentOf(totals.investments, totals.income);
}
