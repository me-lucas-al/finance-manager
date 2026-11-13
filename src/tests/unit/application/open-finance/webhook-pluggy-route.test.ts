import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/composition/open-finance', () => ({
  accountRepository: {
    findAllByPluggyItemId: vi.fn(),
  },
}));

vi.mock('@/composition/pluggy-sync', () => ({
  pluggySync: {
    syncItem: vi.fn(),
  },
}));

import { accountRepository } from '@/composition/open-finance';
import { pluggySync } from '@/composition/pluggy-sync';
import { POST } from '@/app/api/webhook-pluggy/route';

describe('Webhook Pluggy Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLUGGY_WEBHOOK_SECRET = 'secret-token';
  });

  it('rejects unauthorized requests with 401', async () => {
    const req = new NextRequest('http://localhost/api/webhook-pluggy?token=wrong');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('syncs item on transactions/updated event', async () => {
    vi.mocked(accountRepository.findAllByPluggyItemId).mockResolvedValue([
      { userId: 'user-1' } as never,
    ]);
    vi.mocked(pluggySync.syncItem).mockResolvedValue({ imported: 1 });

    const req = new NextRequest('http://localhost/api/webhook-pluggy?token=secret-token', {
      method: 'POST',
      body: JSON.stringify({
        event: 'transactions/updated',
        eventId: 'evt-1',
        itemId: 'item-1',
        transactionIds: ['tx-1'],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(pluggySync.syncItem).toHaveBeenCalledWith('user-1', 'item-1');
  });

  it('syncs item on transactions/created event', async () => {
    vi.mocked(accountRepository.findAllByPluggyItemId).mockResolvedValue([
      { userId: 'user-1' } as never,
    ]);
    vi.mocked(pluggySync.syncItem).mockResolvedValue({ imported: 2 });

    const req = new NextRequest('http://localhost/api/webhook-pluggy?token=secret-token', {
      method: 'POST',
      body: JSON.stringify({
        event: 'transactions/created',
        eventId: 'evt-2',
        itemId: 'item-1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(pluggySync.syncItem).toHaveBeenCalledWith('user-1', 'item-1');
  });
});
