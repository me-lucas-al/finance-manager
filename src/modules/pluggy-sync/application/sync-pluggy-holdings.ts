import { fetchItemInvestments } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import type { LedgerWriter } from '../domain/ledger-writer';

export class SyncPluggyHoldings {
  constructor(private ledger: LedgerWriter) {}

  async execute(userId: string, itemId: string): Promise<void> {
    const holdings = await fetchItemInvestments(itemId);

    for (const holding of holdings) {
      if (!holding.balance || holding.balance <= 0) continue;
      await this.ledger.upsertHolding({
        userId,
        externalId: `pluggy-investment:${holding.id}`,
        name: holding.name,
        type: String(holding.type),
        balance: holding.balance,
      });
    }
  }
}
