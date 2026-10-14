import { fetchItemAccountBalances } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import type { Account, AccountRepository } from '@/modules/open-finance/domain/repositories/account-repository';

export class SyncAccountBalances {
  constructor(private accounts: AccountRepository) {}

  async execute(itemId: string, knownAccounts: Account[]): Promise<void> {
    const balances = await fetchItemAccountBalances(itemId);
    for (const reported of balances) {
      const account = knownAccounts.find((known) => known.pluggyAccountId === reported.pluggyAccountId);
      if (!account) continue;
      await this.accounts.upsert({
        userId: account.userId,
        pluggyAccountId: account.pluggyAccountId,
        pluggyItemId: account.pluggyItemId,
        bank: account.bank,
        accountType: account.accountType,
        itemStatus: account.itemStatus,
        lastSyncedAt: account.lastSyncedAt,
        balance: reported.balance,
        creditLimit: reported.creditLimit,
      });
    }
  }
}
