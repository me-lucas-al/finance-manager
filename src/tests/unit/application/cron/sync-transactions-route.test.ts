import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const listItemOwners = vi.fn();
const syncItem = vi.fn();
const getState = vi.fn();

vi.mock('@/composition/open-finance', () => ({ accountRepository: { listItemOwners } }));
vi.mock('@/composition/pluggy-sync', () => ({ pluggySync: { syncItem } }));
vi.mock('@/composition/onboarding', () => ({ dataModeStore: { getState } }));

const authorizedRequest = () =>
  new NextRequest('http://localhost/api/cron/sync-transactions', { headers: { authorization: 'Bearer top-secret' } });

describe('sync-transactions cron', () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'top-secret';
    listItemOwners.mockReset().mockResolvedValue([
      { pluggyItemId: 'item-manual', userId: 'manual-user' },
      { pluggyItemId: 'item-pluggy', userId: 'pluggy-user' },
    ]);
    syncItem.mockReset().mockResolvedValue(undefined);
    getState.mockReset().mockImplementation(async (userId: string) => ({
      dataMode: userId === 'pluggy-user' ? 'pluggy' : 'manual',
    }));
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  it('syncs only items whose owner is in pluggy mode', async () => {
    const { GET } = await import('@/app/api/cron/sync-transactions/route');

    const body = await (await GET(authorizedRequest())).json();

    expect(syncItem).toHaveBeenCalledTimes(1);
    expect(syncItem).toHaveBeenCalledWith('pluggy-user', 'item-pluggy');
    expect(body).toEqual({ ok: true, items: 2, skipped: 1, failed: 0 });
  });

  it('reports failures without stopping the run', async () => {
    syncItem.mockRejectedValueOnce(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { GET } = await import('@/app/api/cron/sync-transactions/route');

    const body = await (await GET(authorizedRequest())).json();

    expect(body).toEqual({ ok: false, items: 2, skipped: 1, failed: 1 });
  });
});
