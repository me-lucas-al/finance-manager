import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const listItemOwners = vi.fn();
const syncItem = vi.fn();

vi.mock('@/composition/open-finance', () => ({ accountRepository: { listItemOwners } }));
vi.mock('@/composition/pluggy-sync', () => ({ pluggySync: { syncItem } }));

const authorizedRequest = () =>
  new NextRequest('http://localhost/api/cron/sync-transactions', { headers: { authorization: 'Bearer top-secret' } });

describe('sync-transactions cron', () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'top-secret';
    listItemOwners.mockReset().mockResolvedValue([
      { pluggyItemId: 'item-a', userId: 'user-a' },
      { pluggyItemId: 'item-b', userId: 'user-b' },
    ]);
    syncItem.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  it('syncs every connected item with its owner', async () => {
    const { GET } = await import('@/app/api/cron/sync-transactions/route');

    const body = await (await GET(authorizedRequest())).json();

    expect(syncItem).toHaveBeenCalledTimes(2);
    expect(syncItem).toHaveBeenCalledWith('user-a', 'item-a');
    expect(syncItem).toHaveBeenCalledWith('user-b', 'item-b');
    expect(body).toEqual({ ok: true, items: 2, failed: 0 });
  });

  it('reports failures without stopping the run', async () => {
    syncItem.mockRejectedValueOnce(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { GET } = await import('@/app/api/cron/sync-transactions/route');

    const body = await (await GET(authorizedRequest())).json();

    expect(syncItem).toHaveBeenCalledTimes(2);
    expect(body).toEqual({ ok: false, items: 2, failed: 1 });
  });
});
