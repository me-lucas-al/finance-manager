import { describe, it, expect, vi, beforeEach } from 'vitest';

const authMock = vi.fn();
vi.mock('@/auth', () => ({ auth: authMock }));

const valuesMock = vi.fn();
const onConflictDoUpdateMock = vi.fn();

vi.mock('@/db', () => ({
  db: {
    insert: () => ({
      values: (values: unknown) => {
        valuesMock(values);
        return { onConflictDoUpdate: onConflictDoUpdateMock };
      },
    }),
  },
}));

const { POST } = await import('../../../../app/api/push/subscribe/route');

function subscribeRequest(body: unknown) {
  return new Request('http://localhost/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
  keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
};

describe('POST /api/push/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onConflictDoUpdateMock.mockResolvedValue(undefined);
  });

  it('rejects requests from an unauthenticated device', async () => {
    authMock.mockResolvedValue(null);

    const response = await POST(subscribeRequest(validSubscription));

    expect(response.status).toBe(401);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it('saves a subscription for the signed-in user, whether it comes from a desktop or a mobile browser', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(subscribeRequest(validSubscription));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        endpoint: validSubscription.endpoint,
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      })
    );
  });

  it('rejects a malformed subscription payload', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(subscribeRequest({ endpoint: '' }));

    expect(response.status).toBe(500);
    expect(valuesMock).not.toHaveBeenCalled();
  });
});
