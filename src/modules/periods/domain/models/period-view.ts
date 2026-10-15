import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import type { LedgerTotals } from '@/modules/finance/domain/services/summarize-ledger';
import type { PeriodSnapshotRecord } from './period-records';

export type PeriodView = {
  id: string;
  startDate: string;
  endDate: string;
  closed: boolean;
};

export type PeriodHistoryItem = PeriodView & {
  totals: LedgerTotals;
};

export type PeriodDetail = PeriodHistoryItem & {
  snapshot: PeriodSnapshotRecord | null;
  entries: LedgerEntry[];
};
