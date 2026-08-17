import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const requireUserIdMock = vi.fn();
vi.mock('@/app/actions/require-session', () => ({
  requireUserId: requireUserIdMock,
}));

const { getPushPublicKey } = await import('../../../../app/actions/push');

const ORIGINAL_ENV = { ...process.env };

describe('getPushPublicKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserIdMock.mockResolvedValue('user-1');
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('requires an authenticated session', async () => {
    await getPushPublicKey();
    expect(requireUserIdMock).toHaveBeenCalled();
  });

  it('returns the configured VAPID public key so any device can subscribe', async () => {
    process.env.PUSH_PUBLIC_KEY = 'public-key';

    expect(await getPushPublicKey()).toBe('public-key');
  });

  it('returns null when push notifications are not configured on the server', async () => {
    delete process.env.PUSH_PUBLIC_KEY;

    expect(await getPushPublicKey()).toBeNull();
  });

  it('rejects unauthenticated access', async () => {
    requireUserIdMock.mockRejectedValue(new Error('Unauthorized'));

    await expect(getPushPublicKey()).rejects.toThrow('Unauthorized');
  });
});
