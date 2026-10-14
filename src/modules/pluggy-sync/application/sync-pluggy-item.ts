import { fetchTransactionsSince } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import { toLocalDateString } from '@/lib/month';
import type { EntryChangeNotifier } from '@/modules/finance/domain/ports/entry-change-notifier';
import type { Account, AccountRepository } from '@/modules/open-finance/domain/repositories/account-repository';
import type { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { mapPluggyTransactions, type TransactionSource } from '../domain/map-pluggy-transactions';
import type { SyncPeriod } from '../domain/sync-period';
import type { PersistLedgerEntry } from './persist-ledger-entry';
import type { SyncAccountBalances } from './sync-account-balances';
import type { SyncPluggyHoldings } from './sync-pluggy-holdings';

const CREDIT_CARD = 'CREDIT_CARD';

export class SyncPluggyItemUseCase {
  constructor(
    private accounts: AccountRepository,
    private persistEntry: PersistLedgerEntry,
    private syncHoldings: SyncPluggyHoldings,
    private syncBalances: SyncAccountBalances,
    private resolvePeriod: ResolveCurrentPeriodUseCase,
    private notifier: EntryChangeNotifier,
  ) {}

  async syncItem(userId: string, itemId: string): Promise<{ imported: number }> {
    const itemAccounts = (await this.accounts.findAllByPluggyItemId(itemId)).filter(
      (account) => account.userId === userId,
    );
    if (itemAccounts.length === 0) return { imported: 0 };

    const period = await this.resolvePeriod.execute(userId);
    try {
      const imported = await this.importTransactions(userId, itemAccounts, period);
      await this.syncHoldings.execute(userId, itemId);
      await this.syncBalances.execute(itemId, await this.accounts.findAllByPluggyItemId(itemId));
      return { imported };
    } finally {
      await this.notifier.notifyEntriesChanged(userId);
    }
  }

  private async collectSources(accounts: Account[], period: SyncPeriod): Promise<TransactionSource<Account>[]> {
    const dateFrom = toLocalDateString(period.startDate);
    const perAccount = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await fetchTransactionsSince(account.pluggyAccountId, dateFrom);
        return transactions
          .filter((tx) => new Date(tx.date) >= period.startDate)
          .map((tx) => ({ tx, isCreditCard: account.accountType === CREDIT_CARD, origin: account }));
      }),
    );
    return perAccount.flat();
  }

  private async importTransactions(userId: string, accounts: Account[], period: SyncPeriod): Promise<number> {
    const userAccounts = await this.accounts.findAllByUserId(userId);
    const hasCreditCardPurchases = userAccounts.some((account) => account.accountType === CREDIT_CARD);
    const sources = await this.collectSources(accounts, period);

    let imported = 0;
    for (const { origin, entry } of mapPluggyTransactions(sources, hasCreditCardPurchases)) {
      if (await this.persistEntry.execute(userId, origin, entry, period)) imported++;
    }
    await Promise.all(accounts.map((account) => this.markSynced(account)));
    return imported;
  }

  private markSynced(account: Account) {
    return this.accounts.upsert({
      userId: account.userId,
      pluggyAccountId: account.pluggyAccountId,
      pluggyItemId: account.pluggyItemId,
      bank: account.bank,
      accountType: account.accountType,
      itemStatus: account.itemStatus,
      lastSyncedAt: new Date().toISOString(),
    });
  }
}
