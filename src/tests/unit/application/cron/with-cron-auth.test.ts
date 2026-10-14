import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withCronAuth } from '@/app/api/cron/with-cron-auth';

function cronRequest(authorization?: string) {
  const headers = authorization ? { authorization } : undefined;
  return new NextRequest('http://localhost/api/cron/test', { headers });
}

describe('withCronAuth', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects requests with a wrong bearer token when a secret is configured', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const handler = vi.fn();

    const response = await withCronAuth(handler)(cronRequest('Bearer other'));

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('delegates to the handler when the bearer token matches', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));

    const response = await withCronAuth(handler)(cronRequest('Bearer secret'));

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('delegates to the handler when no secret is configured', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));

    await withCronAuth(handler)(cronRequest());

    expect(handler).toHaveBeenCalledOnce();
  });
});
