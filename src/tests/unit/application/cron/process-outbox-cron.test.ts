import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/composition/outbox', () => ({
  relayOutbox: {
    execute: vi.fn(),
  },
}));

import { relayOutbox } from '@/composition/outbox';
import { GET } from '@/app/api/cron/process-outbox/route';

describe('Process Outbox Cron Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'cron-secret';
  });

  it('rejects unauthorized calls with 401', async () => {
    const req = new NextRequest('http://localhost/api/cron/process-outbox', {
      headers: { authorization: 'Bearer wrong' },
    });

    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('executes relay when authorized', async () => {
    vi.mocked(relayOutbox.execute).mockResolvedValue({ processed: 2, succeeded: 2, failed: 0 });

    const req = new NextRequest('http://localhost/api/cron/process-outbox', {
      headers: { authorization: 'Bearer cron-secret' },
    });

    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(relayOutbox.execute).toHaveBeenCalled();
  });
});
