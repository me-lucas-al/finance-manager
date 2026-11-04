import { describe, it, expect, vi } from 'vitest';
import { ListConnectedBanksUseCase } from '@/modules/open-finance/application/use-cases/list-connected-banks';
import type { Account } from '@/modules/open-finance/domain/repositories/account-repository';

describe('ListConnectedBanksUseCase', () => {
  it('reads the accounts of the user and groups them by connection', async () => {
    const findAllByUserId = vi.fn(async (): Promise<Account[]> => [
      {
        id: 'a1',
        userId: 'user-1',
        pluggyAccountId: 'pa1',
        pluggyItemId: 'item-1',
        bank: 'inter',
        accountType: 'BANK',
        itemStatus: 'UPDATING',
        lastSyncedAt: null,
        balance: 10,
        creditLimit: null,
        createdAt: '2026-10-01T00:00:00Z',
      },
    ]);

    const banks = await new ListConnectedBanksUseCase({ findAllByUserId }).execute('user-1');

    expect(findAllByUserId).toHaveBeenCalledWith('user-1');
    expect(banks).toEqual([{ itemId: 'item-1', name: 'Inter', health: 'updating', accountCount: 1, lastSyncedAt: null }]);
  });
});
