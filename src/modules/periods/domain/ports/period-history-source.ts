import type { PeriodEntryRef, PeriodRecord, PeriodSnapshotRecord } from '../models/period-records';

export interface PeriodHistorySource {
  findPeriods(userId: string): Promise<PeriodRecord[]>;
  findSnapshots(userId: string): Promise<PeriodSnapshotRecord[]>;
  findEntryRefs(userId: string): Promise<PeriodEntryRef[]>;
}
