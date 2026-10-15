import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { totalsOf, type LedgerTotals } from '@/modules/finance/domain/services/summarize-ledger';
import type { PeriodEntryRef, PeriodRecord, PeriodSnapshotRecord } from '../models/period-records';
import type { PeriodDetail, PeriodHistoryItem, PeriodView } from '../models/period-view';
import { toPeriodDateString } from './period-date';
import { entriesOfPeriod, scopeOfPeriod } from './period-entries';

export type PeriodHistoryInput = {
  snapshots: PeriodSnapshotRecord[];
  refs: PeriodEntryRef[];
  ledger: LedgerEntry[];
};

export function toPeriodView(period: PeriodRecord): PeriodView {
  return {
    id: period.id,
    startDate: toPeriodDateString(period.startDate),
    endDate: toPeriodDateString(period.endDate),
    closed: period.status === 'CLOSED',
  };
}

function totalsOfSnapshot(snapshot: PeriodSnapshotRecord): LedgerTotals {
  return {
    income: snapshot.totalIncomes,
    expenses: snapshot.totalExpenses,
    investments: snapshot.totalInvestments,
    balance: snapshot.balance,
  };
}

export function buildPeriodDetail(period: PeriodRecord, input: PeriodHistoryInput): PeriodDetail {
  const view = toPeriodView(period);
  const entries = entriesOfPeriod(input.ledger, scopeOfPeriod(view, input.refs));
  const snapshot = view.closed ? (input.snapshots.find((item) => item.periodId === period.id) ?? null) : null;
  const totals = snapshot ? totalsOfSnapshot(snapshot) : totalsOf(entries);
  return { ...view, totals, snapshot, entries };
}

export function buildPeriodHistory(periods: PeriodRecord[], input: PeriodHistoryInput): PeriodHistoryItem[] {
  return [...periods]
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .map((period) => {
      const { id, startDate, endDate, closed, totals } = buildPeriodDetail(period, input);
      return { id, startDate, endDate, closed, totals };
    });
}
