import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import type { PeriodEntryRef } from '../models/period-records';
import type { PeriodView } from '../models/period-view';

export type PeriodScope = {
  startDate: string;
  endDate: string;
  incomeIds: ReadonlySet<string>;
  investmentIds: ReadonlySet<string>;
};

function idsOfKind(refs: PeriodEntryRef[], periodId: string, kind: PeriodEntryRef['kind']): Set<string> {
  const matching = refs.filter((ref) => ref.periodId === periodId && ref.kind === kind);
  return new Set(matching.map((ref) => ref.id));
}

export function scopeOfPeriod(period: PeriodView, refs: PeriodEntryRef[]): PeriodScope {
  return {
    startDate: period.startDate,
    endDate: period.endDate,
    incomeIds: idsOfKind(refs, period.id, 'income'),
    investmentIds: idsOfKind(refs, period.id, 'investment'),
  };
}

function belongsToPeriod(entry: LedgerEntry, scope: PeriodScope): boolean {
  if (entry.kind === 'income') return scope.incomeIds.has(entry.id);
  if (entry.kind === 'investment') return scope.investmentIds.has(entry.id);
  return entry.date >= scope.startDate && entry.date <= scope.endDate;
}

export function entriesOfPeriod(entries: LedgerEntry[], scope: PeriodScope): LedgerEntry[] {
  return entries.filter((entry) => belongsToPeriod(entry, scope));
}
