import type { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { toBrazilDateString } from '@/lib/format';
import { fetchTransactionsSince } from '@/lib/pluggy-items';
import type { Account, AccountRepository } from '@/modules/open-finance/domain/repositories/account-repository';
import type { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { mapPluggyTransaction } from '../domain/map-pluggy-transaction';
import type { SyncPeriod } from '../domain/sync-period';
import type { PersistLedgerEntry } from './persist-ledger-entry';
import type { SyncPluggyHoldings } from './sync-pluggy-holdings';

export class SyncPluggyItemUseCase {
  constructor(
    private accounts: AccountRepository,
    private persistEntry: PersistLedgerEntry,
    private syncHoldings: SyncPluggyHoldings,
    private resolvePeriod: ResolveCurrentPeriodUseCase,
  ) {}

  async ingestTransactions(
    userId: string,
    account: Account,
    pluggyTransactions: PluggyTransaction[],
    period: SyncPeriod,
  ): Promise<number> {
    const isCreditCard = account.accountType === 'CREDIT_CARD';
    let imported = 0;

    for (const transaction of pluggyTransactions) {
      if (new Date(transaction.date) < period.startDate) continue;
      const entry = mapPluggyTransaction(transaction, { isCreditCard });
      if (!entry) continue;
      if (await this.persistEntry.execute(userId, account, entry, period)) imported++;
    }

    await this.markSynced(account);
    return imported;
  }

  async syncItem(userId: string, itemId: string): Promise<{ imported: number }> {
    const accounts = (await this.accounts.findAllByPluggyItemId(itemId)).filter((account) => account.userId === userId);
    if (accounts.length === 0) return { imported: 0 };

    const period = await this.resolvePeriod.execute(userId);
    const dateFrom = toBrazilDateString(period.startDate);

    let imported = 0;
    for (const account of accounts) {
      const transactions = await fetchTransactionsSince(account.pluggyAccountId, dateFrom);
      imported += await this.ingestTransactions(userId, account, transactions, period);
    }
    await this.syncHoldings.execute(userId, itemId, period);
    return { imported };
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
