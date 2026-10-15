import type { EntryRef } from '../../modules/finance/domain/models/entry-changes';
import type { FixedLaunchLookup } from '../../modules/finance/domain/ports/fixed-launch-lookup';
import type { Income } from '../../modules/finance/domain/repositories/income-repository';
import type { Transaction } from '../../modules/open-finance/domain/repositories/transaction-repository';

type LaunchSources = {
  transactions: () => Promise<Transaction[]>;
  incomes: () => Income[];
};

export class FakeFixedLaunchLookup implements FixedLaunchLookup {
  constructor(private readonly sources: LaunchSources) {}

  async findLaunchedRuleIds(userId: string, month: string): Promise<Set<string>> {
    const launches = await this.listLaunches(month);
    return new Set(launches.filter((launch) => launch.userId === userId).map((launch) => launch.fixedEntryId));
  }

  async findLaunch(userId: string, fixedEntryId: string, month: string): Promise<EntryRef | null> {
    const launch = (await this.listLaunches(month)).find(
      (item) => item.userId === userId && item.fixedEntryId === fixedEntryId
    );
    return launch ? { kind: launch.kind, id: launch.id } : null;
  }

  private async listLaunches(month: string) {
    const expenses = (await this.sources.transactions()).map((item) => ({
      kind: 'expense' as const,
      id: item.id,
      userId: item.userId,
      fixedEntryId: item.fixedEntryId,
      month: item.fixedReferenceMonth,
    }));
    const incomes = this.sources.incomes().map((item) => ({
      kind: 'income' as const,
      id: item.id,
      userId: item.userId,
      fixedEntryId: item.fixedEntryId,
      month: item.fixedReferenceMonth,
    }));
    return [...expenses, ...incomes].filter(
      (item): item is typeof item & { fixedEntryId: string } => item.fixedEntryId !== null && item.month === month
    );
  }
}
