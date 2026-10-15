import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const findUserIds = vi.fn();
const generate = vi.fn();
const reminders = vi.fn();

vi.mock('@/composition/fixed-entries', () => ({
  fixedEntryRepository: { findUserIdsWithActiveEntries: findUserIds },
  generateDueFixedEntries: { execute: generate },
  sendFixedEntryReminders: { execute: reminders },
}));

const request = (authorization?: string) =>
  new NextRequest('http://localhost/api/cron/fixed-entries', { headers: authorization ? { authorization } : {} });

describe('fixed-entries cron', () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'top-secret';
    findUserIds.mockReset().mockResolvedValue(['u1', 'u2']);
    generate.mockReset().mockResolvedValue({ launched: 2, alreadyLaunched: 0, failed: 0 });
    reminders.mockReset().mockResolvedValue(1);
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  it('rejects a request without the secret', async () => {
    const { GET } = await import('@/app/api/cron/fixed-entries/route');
    expect((await GET(request())).status).toBe(401);
    expect(generate).not.toHaveBeenCalled();
  });

  it('rejects a wrong secret', async () => {
    const { GET } = await import('@/app/api/cron/fixed-entries/route');
    expect((await GET(request('Bearer nope'))).status).toBe(401);
  });

  it('rejects every request when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    const { GET } = await import('@/app/api/cron/fixed-entries/route');
    expect((await GET(request('Bearer undefined'))).status).toBe(401);
    expect((await GET(request())).status).toBe(401);
  });

  it('generates entries and reminders for every user', async () => {
    const { GET } = await import('@/app/api/cron/fixed-entries/route');

    const response = await GET(request('Bearer top-secret'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, users: 2, failed: 0, launched: 4, launchFailures: 0, remindersSent: 2 });
    expect(generate).toHaveBeenCalledWith('u1');
    expect(generate).toHaveBeenCalledWith('u2');
  });

  it('keeps going when one user fails and reports it', async () => {
    generate.mockRejectedValueOnce(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { GET } = await import('@/app/api/cron/fixed-entries/route');

    const body = await (await GET(request('Bearer top-secret'))).json();

    expect(body).toMatchObject({ ok: false, users: 2, failed: 1, launched: 2 });
  });
});
