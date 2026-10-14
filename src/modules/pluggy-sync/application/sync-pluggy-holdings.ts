import { fetchItemInvestments } from '@/lib/pluggy-items';
import type { LedgerWriter } from '../domain/ledger-writer';
import type { SyncPeriod } from '../domain/sync-period';

export class SyncPluggyHoldings {
  constructor(private ledger: LedgerWriter) {}

  async execute(userId: string, itemId: string, period: SyncPeriod): Promise<void> {
    const holdings = await fetchItemInvestments(itemId);

    for (const holding of holdings) {
      if (!holding.balance || holding.balance <= 0) continue;
      await this.ledger.upsertHolding({
        userId,
        periodId: period.id,
        externalId: `pluggy-investment:${holding.id}`,
        amount: holding.balance,
        description: holding.name,
        type: String(holding.type),
        date: new Date(),
      });
    }
  }
}
