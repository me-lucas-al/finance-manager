import { fetchItemInvestments } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import type { LedgerWriter } from '../domain/ledger-writer';

export class SyncPluggyHoldings {
  constructor(private ledger: LedgerWriter) {}

  async execute(userId: string, itemId: string): Promise<void> {
    const fetched = await fetchItemInvestments(itemId);
    const positions = fetched
      .filter((holding) => holding.balance && holding.balance > 0)
      .map((holding) => ({
        userId,
        itemId,
        externalId: `pluggy-investment:${holding.id}`,
        name: holding.name,
        type: String(holding.type),
        balance: holding.balance,
      }));
    await this.ledger.replaceItemHoldings(userId, itemId, positions);
  }
}
