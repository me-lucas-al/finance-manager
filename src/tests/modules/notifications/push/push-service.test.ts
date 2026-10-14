import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const selectWhereMock = vi.fn();
const deleteWhereMock = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: selectWhereMock }) }),
    delete: () => ({ where: deleteWhereMock }),
  },
}));

class FakeWebPushError extends Error {
  statusCode: number;
  constructor(statusCode: number) {
    super('web-push error');
    this.statusCode = statusCode;
  }
}

const sendNotificationMock = vi.fn();
const setVapidDetailsMock = vi.fn();

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: (...args: unknown[]) => setVapidDetailsMock(...args),
    sendNotification: (...args: unknown[]) => sendNotificationMock(...args),
    WebPushError: FakeWebPushError,
  },
}));

const { PushService } = await import('../../../../modules/notifications/push/PushService');
const { NotificationType } = await import('../../../../modules/notifications/domain/NotificationTypes');

const ORIGINAL_ENV = { ...process.env };

describe('PushService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PUSH_PUBLIC_KEY = 'public-key';
    process.env.PUSH_PRIVATE_KEY = 'private-key';
    process.env.PUSH_SUBJECT = 'mailto:test@example.com';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  const payload = {
    userId: 'user-1',
    type: NotificationType.EXPENSE_WARNING,
    title: 'Título',
    message: 'Mensagem',
  };

  it('skips sending when VAPID keys are not configured (desktop and mobile push both rely on them)', async () => {
    delete process.env.PUSH_PUBLIC_KEY;

    await PushService.sendNotificationToUser('user-1', payload);

    expect(selectWhereMock).not.toHaveBeenCalled();
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it('sends the notification payload to every subscription registered for the user', async () => {
    selectWhereMock.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth: 'a1' },
      { id: 'sub-2', userId: 'user-1', endpoint: 'https://push.example/2', p256dh: 'p2', auth: 'a2' },
    ]);
    sendNotificationMock.mockResolvedValue(undefined);

    await PushService.sendNotificationToUser('user-1', payload);

    expect(setVapidDetailsMock).toHaveBeenCalledWith('mailto:test@example.com', 'public-key', 'private-key');
    expect(sendNotificationMock).toHaveBeenCalledTimes(2);

    const [subscription, body] = sendNotificationMock.mock.calls[0];
    expect(subscription).toEqual({ endpoint: 'https://push.example/1', keys: { p256dh: 'p1', auth: 'a1' } });
    expect(JSON.parse(body)).toEqual({ title: 'Título', message: 'Mensagem', type: NotificationType.EXPENSE_WARNING });
  });

  it('removes a subscription once its device (PC or phone) has unsubscribed (410 Gone)', async () => {
    selectWhereMock.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth: 'a1' },
    ]);
    sendNotificationMock.mockRejectedValue(new FakeWebPushError(410));

    await PushService.sendNotificationToUser('user-1', payload);

    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
  });

  it('removes a subscription the push service no longer recognizes (404 Not Found)', async () => {
    selectWhereMock.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth: 'a1' },
    ]);
    sendNotificationMock.mockRejectedValue(new FakeWebPushError(404));

    await PushService.sendNotificationToUser('user-1', payload);

    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the subscription when delivery fails for a reason other than an expired subscription', async () => {
    selectWhereMock.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth: 'a1' },
    ]);
    sendNotificationMock.mockRejectedValue(new Error('network error'));

    await PushService.sendNotificationToUser('user-1', payload);

    expect(deleteWhereMock).not.toHaveBeenCalled();
  });

  it('continues sending to remaining subscriptions even if one delivery fails', async () => {
    selectWhereMock.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth: 'a1' },
      { id: 'sub-2', userId: 'user-1', endpoint: 'https://push.example/2', p256dh: 'p2', auth: 'a2' },
    ]);
    sendNotificationMock
      .mockRejectedValueOnce(new Error('device offline'))
      .mockResolvedValueOnce(undefined);

    await PushService.sendNotificationToUser('user-1', payload);

    expect(sendNotificationMock).toHaveBeenCalledTimes(2);
  });
});
