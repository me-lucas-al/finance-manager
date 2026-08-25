import { describe, it, expect, vi, beforeEach } from 'vitest';

const requireUserIdMock = vi.fn();
vi.mock('@/app/actions/require-session', () => ({
  requireUserId: requireUserIdMock,
}));

const updateTagMock = vi.fn();
vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
  cacheTag: vi.fn(),
}));

const limitMock = vi.fn();
const updateSetMock = vi.fn();
const updateWhereMock = vi.fn();
const deleteWhereMock = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => ({ limit: limitMock }) }) }) }),
    update: () => ({
      set: (values: unknown) => {
        updateSetMock(values);
        return { where: updateWhereMock };
      },
    }),
    delete: () => ({ where: deleteWhereMock }),
  },
}));

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} = await import('../../../../app/actions/notifications');

describe('notifications actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserIdMock.mockResolvedValue('user-1');
  });

  it('requires an authenticated user before listing notifications', async () => {
    limitMock.mockResolvedValue([]);
    await getNotifications();
    expect(requireUserIdMock).toHaveBeenCalled();
  });

  it('returns the current user notifications', async () => {
    const rows = [{ id: 'n-1', title: 'Título', message: 'Msg', readAt: null, createdAt: new Date() }];
    limitMock.mockResolvedValue(rows);

    expect(await getNotifications()).toBe(rows);
  });

  it('marks a single notification as read and refreshes its cache tag', async () => {
    updateWhereMock.mockResolvedValue(undefined);

    await markNotificationAsRead('notif-1');

    expect(updateSetMock).toHaveBeenCalledWith(expect.objectContaining({ readAt: expect.any(Date) }));
    expect(updateTagMock).toHaveBeenCalledWith('notifications-user-1');
  });

  it('marks every notification as read', async () => {
    updateWhereMock.mockResolvedValue(undefined);

    await markAllNotificationsAsRead();

    expect(updateSetMock).toHaveBeenCalledWith(expect.objectContaining({ readAt: expect.any(Date) }));
    expect(updateTagMock).toHaveBeenCalledWith('notifications-user-1');
  });

  it('clears all notifications for the current user', async () => {
    deleteWhereMock.mockResolvedValue(undefined);

    await clearAllNotifications();

    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).toHaveBeenCalledWith('notifications-user-1');
  });

  it('rejects unauthenticated access', async () => {
    requireUserIdMock.mockRejectedValue(new Error('Unauthorized'));

    await expect(getNotifications()).rejects.toThrow('Unauthorized');
  });
});
