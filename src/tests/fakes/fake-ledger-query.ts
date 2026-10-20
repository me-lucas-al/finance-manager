import type { LedgerEntry, LedgerKind } from '@/modules/finance/domain/models/ledger-entry';
import type { LedgerQuery, LedgerScope, LedgerSearch } from '@/modules/finance/domain/ports/ledger-query';
import { sortNewestFirst } from '@/modules/finance/domain/services/ledger-mapper';
import { totalsByCategory, totalsOf } from '@/modules/finance/domain/services/summarize-ledger';

export const periodIdOfMonth = (month: string): string => `period-${month}`;

export class FakeLedgerQuery implements LedgerQuery {
  public calls = 0;

  constructor(private readonly entries: LedgerEntry[]) {}

  async totals(_userId: string, scope: LedgerScope) {
    this.calls++;
    return totalsOf(this.within(scope));
  }

  async totalsByCategory(_userId: string, kind: LedgerKind, scope: LedgerScope) {
    this.calls++;
    return totalsByCategory(this.within(scope), kind);
  }

  async search(_userId: string, filter: LedgerSearch) {
    this.calls++;
    const needle = filter.text?.trim().toLowerCase();
    return sortNewestFirst(this.within(filter))
      .filter((entry) => !filter.kind || entry.kind === filter.kind)
      .filter((entry) => !filter.category || entry.category.toLowerCase() === filter.category.toLowerCase())
      .filter((entry) => !needle || `${entry.description} ${entry.category}`.toLowerCase().includes(needle))
      .slice(0, filter.limit);
  }

  private within(scope: LedgerScope): LedgerEntry[] {
    return this.entries
      .filter((entry) => !scope.periodId || periodIdOfMonth(entry.date.slice(0, 7)) === scope.periodId)
      .filter((entry) => !scope.manualOnly || !entry.imported);
  }
}
