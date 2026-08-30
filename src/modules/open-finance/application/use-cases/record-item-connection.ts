import { fetchItemConnectionInfo } from '@/lib/pluggy';
import type { Account, AccountRepository } from '../../domain/repositories/account-repository';

export class RecordItemConnectionUseCase {
  constructor(private accountRepository: AccountRepository) {}

  // Runs right after PluggyConnect's onSuccess, before any transaction webhook
  // has ever fired for this item. Records status/accounts up front so a
  // stalled or errored connection (LOGIN_ERROR, OUTDATED, ...) is visible in
  // the accounts table immediately instead of only being inferable from the
  // absence of transactions.
  async execute(userId: string, itemId: string): Promise<Account[]> {
    const info = await fetchItemConnectionInfo(itemId);

    return Promise.all(
      info.accounts.map(async (account) => {
        const existing = await this.accountRepository.findByPluggyAccountId(account.id);
        return this.accountRepository.upsert({
          userId: existing?.userId ?? userId,
          pluggyAccountId: account.id,
          pluggyItemId: itemId,
          bank: info.bank,
          accountType: account.accountType,
          itemStatus: info.status,
          lastSyncedAt: existing?.lastSyncedAt ?? null,
        });
      }),
    );
  }
}
