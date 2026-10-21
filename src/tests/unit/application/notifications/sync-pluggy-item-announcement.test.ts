import { describe, it, expect, beforeEach, vi } from 'vitest';

const fetchTransactionsSince = vi.fn();
vi.mock('@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items', () => ({ fetchTransactionsSince }));

const account = {
  id: 'acc-1',
  userId: 'u1',
  pluggyAccountId: 'pa-1',
  pluggyItemId: 'item-1',
  bank: 'Itaú',
  accountType: 'CHECKING_ACCOUNT',
  itemStatus: 'UPDATED',
  lastSyncedAt: null,
};

const debit = (id: string, amount: number) => ({
  id,
  date: new Date().toISOString(),
  description: `Compra ${id}`,
  type: 'DEBIT',
  amount: -amount,
  category: 'Shopping',
});

describe('SyncPluggyItemUseCase announcement', () => {
  const announce = vi.fn();
  const persist = vi.fn();

  beforeEach(() => {
    announce.mockReset().mockResolvedValue(undefined);
    persist.mockReset().mockResolvedValue(true);
    fetchTransactionsSince.mockReset().mockResolvedValue([debit('t1', 40), debit('t2', 15)]);
  });

  const build = async () => {
    const { SyncPluggyItemUseCase } = await import('@/modules/pluggy-sync/application/sync-pluggy-item');
    const accounts = {
      findAllByPluggyItemId: vi.fn().mockResolvedValue([account]),
      findAllByUserId: vi.fn().mockResolvedValue([account]),
      upsert: vi.fn().mockResolvedValue(account),
    };
    const period = { id: 'p1', startDate: new Date('2000-01-01T00:00:00Z') };
    return new SyncPluggyItemUseCase(
      accounts as never,
      { execute: persist } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn().mockResolvedValue(period) } as never,
      { notifyEntriesChanged: vi.fn() },
      { announce },
    );
  };

  it('announces the entries that were actually imported', async () => {
    persist.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const result = await (await build()).syncItem('u1', 'item-1');

    expect(result.imported).toBe(1);
    expect(announce).toHaveBeenCalledTimes(1);
    const [userId, entries] = announce.mock.calls[0];
    expect(userId).toBe('u1');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: 'expense', bank: 'Itaú', amount: 40 });
  });

  it('announces an empty list when everything was already stored', async () => {
    persist.mockResolvedValue(false);

    await (await build()).syncItem('u1', 'item-1');

    expect(announce).toHaveBeenCalledWith('u1', []);
  });
});
