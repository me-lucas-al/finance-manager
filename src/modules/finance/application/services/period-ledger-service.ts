import { shiftMonth } from '@/lib/month';
import type { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { toPeriodWindow, type PeriodWindow } from '@/modules/periods/domain/period-window';
import type { PeriodRepository } from '@/modules/periods/domain/repositories/period-repository';
import type { LedgerKind } from '../../domain/models/ledger-entry';
import type { SnapshotAggregates } from '../../domain/models/snapshot-aggregates';
import type { DataModeReader } from '../../domain/ports/data-mode-reader';
import type { LedgerQuery, LedgerScope } from '../../domain/ports/ledger-query';
import { EMPTY_TOTALS } from '../../domain/services/summarize-ledger';

export type PeriodSearch = { periodId?: string; kind?: LedgerKind; category?: string; text?: string; limit: number };

export type PeriodSnapshotData = { window: PeriodWindow; aggregates: SnapshotAggregates };

export class PeriodLedgerService {
  constructor(
    private readonly query: LedgerQuery,
    private readonly modes: DataModeReader,
    private readonly currentPeriod: ResolveCurrentPeriodUseCase,
    private readonly periods: Pick<PeriodRepository, 'findByStartMonth'>,
  ) {}

  async currentWindow(userId: string): Promise<PeriodWindow> {
    return toPeriodWindow(await this.currentPeriod.execute(userId));
  }

  async windowForMonth(userId: string, month: string): Promise<PeriodWindow | null> {
    const period = await this.periods.findByStartMonth(userId, month);
    return period ? toPeriodWindow(period) : null;
  }

  async totals(userId: string, periodId?: string) {
    return this.query.totals(userId, await this.scope(userId, periodId));
  }

  async totalsByCategory(userId: string, kind: LedgerKind, periodId?: string) {
    return this.query.totalsByCategory(userId, kind, await this.scope(userId, periodId));
  }

  async search(userId: string, filter: PeriodSearch) {
    return this.query.search(userId, { ...filter, manualOnly: await this.modes.isManualMode(userId) });
  }

  async snapshotData(userId: string): Promise<PeriodSnapshotData> {
    const [manualOnly, window] = await Promise.all([this.modes.isManualMode(userId), this.currentWindow(userId)]);
    const [previous, twoAgo] = await Promise.all(
      [1, 2].map((back) => this.windowForMonth(userId, shiftMonth(window.referenceMonth, -back))),
    );
    const totalsOf = (period: PeriodWindow | null) =>
      period ? this.query.totals(userId, { periodId: period.id, manualOnly }) : Promise.resolve(EMPTY_TOTALS);
    const categoriesOf = (period: PeriodWindow | null) =>
      period ? this.query.totalsByCategory(userId, 'expense', { periodId: period.id, manualOnly }) : Promise.resolve([]);
    const [current, previousTotals, twoAgoTotals, currentCategories, previousCategories, allTime] = await Promise.all([
      totalsOf(window),
      totalsOf(previous),
      totalsOf(twoAgo),
      categoriesOf(window),
      categoriesOf(previous),
      this.query.totals(userId, { manualOnly }),
    ]);
    const aggregates = { current, previous: previousTotals, twoAgo: twoAgoTotals, currentCategories, previousCategories, allTime };
    return { window, aggregates };
  }

  private async scope(userId: string, periodId?: string): Promise<LedgerScope> {
    return { periodId, manualOnly: await this.modes.isManualMode(userId) };
  }
}
