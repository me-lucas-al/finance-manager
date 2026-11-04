import { describe, it, expect } from 'vitest';
import { groupConnectedBanks, healthOfItemStatus } from '@/modules/open-finance/domain/connected-bank';
import type { Account } from '@/modules/open-finance/domain/repositories/account-repository';

const account = (overrides: Partial<Account>): Account => ({
  id: 'a1',
  userId: 'user-1',
  pluggyAccountId: 'pa1',
  pluggyItemId: 'item-1',
  bank: 'nubank',
  accountType: 'BANK',
  itemStatus: 'UPDATED',
  lastSyncedAt: null,
  balance: null,
  creditLimit: null,
  createdAt: '2026-10-01T00:00:00Z',
  ...overrides,
});

describe('healthOfItemStatus', () => {
  it('maps the Pluggy item status to a health level', () => {
    expect(healthOfItemStatus('UPDATED')).toBe('healthy');
    expect(healthOfItemStatus('UPDATING')).toBe('updating');
    expect(healthOfItemStatus(null)).toBe('updating');
    expect(healthOfItemStatus('LOGIN_ERROR')).toBe('attention');
    expect(healthOfItemStatus('OUTDATED')).toBe('attention');
  });
});

describe('groupConnectedBanks', () => {
  it('groups the accounts of one connection into a single bank', () => {
    const banks = groupConnectedBanks([
      account({ id: 'a1', pluggyAccountId: 'pa1', lastSyncedAt: '2026-11-01T10:00:00Z' }),
      account({ id: 'a2', pluggyAccountId: 'pa2', accountType: 'CREDIT_CARD', lastSyncedAt: '2026-11-02T10:00:00Z' }),
    ]);

    expect(banks).toEqual([
      { itemId: 'item-1', name: 'Nubank', health: 'healthy', accountCount: 2, lastSyncedAt: '2026-11-02T10:00:00Z' },
    ]);
  });

  it('lists each connection separately, sorted by name, keeping unknown bank names as they come', () => {
    const banks = groupConnectedBanks([
      account({ pluggyItemId: 'item-2', bank: 'itau' }),
      account({ pluggyItemId: 'item-3', bank: 'Banco Exemplo', itemStatus: 'LOGIN_ERROR' }),
      account({ pluggyItemId: 'item-1', bank: 'inter' }),
    ]);

    expect(banks.map((bank) => [bank.name, bank.health])).toEqual([
      ['Banco Exemplo', 'attention'],
      ['Inter', 'healthy'],
      ['Itaú', 'healthy'],
    ]);
  });

  it('returns nothing when there are no accounts', () => {
    expect(groupConnectedBanks([])).toEqual([]);
  });
});
