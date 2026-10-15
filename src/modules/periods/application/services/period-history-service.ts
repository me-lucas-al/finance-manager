import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import type { PeriodHistorySource } from '../../domain/ports/period-history-source';
import type { PeriodDetail, PeriodHistoryItem } from '../../domain/models/period-view';
import type { PeriodRecord } from '../../domain/models/period-records';
import { buildPeriodDetail, buildPeriodHistory, type PeriodHistoryInput } from '../../domain/services/build-period-history';

export type LedgerLoader = (userId: string) => Promise<LedgerEntry[]>;

export class PeriodHistoryService {
  constructor(
    private readonly source: PeriodHistorySource,
    private readonly loadLedger: LedgerLoader
  ) {}

  async listHistory(userId: string): Promise<PeriodHistoryItem[]> {
    const [periods, input] = await Promise.all([this.ownedPeriods(userId), this.loadInput(userId)]);
    return buildPeriodHistory(periods, input);
  }

  async findDetail(userId: string, periodId: string): Promise<PeriodDetail | null> {
    const periods = await this.ownedPeriods(userId);
    const period = periods.find((candidate) => candidate.id === periodId);
    if (!period) return null;
    return buildPeriodDetail(period, await this.loadInput(userId));
  }

  private async ownedPeriods(userId: string): Promise<PeriodRecord[]> {
    const periods = await this.source.findPeriods(userId);
    return periods.filter((period) => period.userId === userId);
  }

  private async loadInput(userId: string): Promise<PeriodHistoryInput> {
    const [snapshots, refs, ledger] = await Promise.all([
      this.source.findSnapshots(userId),
      this.source.findEntryRefs(userId),
      this.loadLedger(userId),
    ]);
    return { snapshots, refs, ledger };
  }
}
