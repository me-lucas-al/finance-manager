import { fetchItemConnectionInfo } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import type { Account, AccountRepository } from '../../domain/repositories/account-repository';

export class AccountOwnedByAnotherUserError extends Error {
  constructor() {
    super('Esta conta bancária já está conectada a outro usuário.');
  }
}

export class RecordItemConnectionUseCase {
  constructor(private accountRepository: AccountRepository) {}

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
