import type { PeriodHistorySource } from '@/modules/periods/domain/ports/period-history-source';
import type {
  PeriodEntryRef,
  PeriodRecord,
  PeriodSnapshotRecord,
} from '@/modules/periods/domain/models/period-records';

export const periodRecord = (
  id: string,
  startDate: string,
  endDate: string,
  status: 'OPEN' | 'CLOSED',
  userId = 'u'
): PeriodRecord => ({
  id,
  userId,
  startDate: new Date(`${startDate}T00:00:00`),
  endDate: new Date(`${endDate}T23:59:59`),
  status,
});

export const snapshotRecord = (periodId: string, totals: Partial<PeriodSnapshotRecord> = {}): PeriodSnapshotRecord => ({
  periodId,
  totalIncomes: 5000,
  totalExpenses: 2000,
  totalInvestments: 1000,
  balance: 2000,
  expensePercentage: 40,
  investmentPercentage: 20,
  status: 'ON_TRACK',
  ...totals,
});

export class FakePeriodHistorySource implements PeriodHistorySource {
  constructor(
    private readonly periods: PeriodRecord[] = [],
    private readonly snapshots: PeriodSnapshotRecord[] = [],
    private readonly refs: PeriodEntryRef[] = []
  ) {}

  async findPeriods() {
    return this.periods;
  }

  async findSnapshots() {
    return this.snapshots;
  }

  async findEntryRefs() {
    return this.refs;
  }
}
