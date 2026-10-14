import type { PeriodSnapshot } from '../models/period-snapshot';

export interface PeriodSnapshotRepository {
  findByIdAndUserId(snapshotId: string, userId: string): Promise<PeriodSnapshot | null>;
}
