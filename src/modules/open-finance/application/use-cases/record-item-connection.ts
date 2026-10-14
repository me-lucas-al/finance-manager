import { fetchItemConnectionInfo } from '@/lib/pluggy';
import type { Account, AccountRepository } from '../../domain/repositories/account-repository';

export class AccountOwnedByAnotherUserError extends Error {
  constructor() {
    super('Esta conta bancária já está conectada a outro usuário.');
  }
}

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
        if (existing && existing.userId !== userId) throw new AccountOwnedByAnotherUserError();
        return this.accountRepository.upsert({
          userId,
          pluggyAccountId: account.id,
          pluggyItemId: itemId,
          bank: account.bank,
          accountType: account.accountType,
          itemStatus: info.status,
          lastSyncedAt: existing?.lastSyncedAt ?? null,
        });
      }),
    );
  }
}
