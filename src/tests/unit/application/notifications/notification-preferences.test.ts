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

const selectWhereMock = vi.fn();
const updateSetMock = vi.fn();
const updateWhereMock = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: selectWhereMock }) }),
    update: () => ({
      set: (values: unknown) => {
        updateSetMock(values);
        return { where: updateWhereMock };
      },
    }),
  },
}));

const { getNotificationPreferences, updateNotificationPreferences } = await import(
  '../../../../app/actions/notification-preferences'
);

function formDataWith(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe('notification preferences actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserIdMock.mockResolvedValue('user-1');
    updateWhereMock.mockResolvedValue(undefined);
  });

  it('returns null when the user has no preferences row yet', async () => {
    selectWhereMock.mockResolvedValue([]);

    expect(await getNotificationPreferences()).toBeNull();
  });

  it('returns the stored preferences for the user', async () => {
    const prefs = { userId: 'user-1', pushNotificationsEnabled: true };
    selectWhereMock.mockResolvedValue([prefs]);

    expect(await getNotificationPreferences()).toBe(prefs);
  });

  it('turns an unchecked checkbox into false instead of leaving the previous value', async () => {
    // "generalNotificationsEnabled" is intentionally omitted, simulating an unchecked checkbox.
    const formData = formDataWith({
      expenseNotificationsEnabled: 'true',
      investmentNotificationsEnabled: 'true',
      goalNotificationsEnabled: 'true',
      closingNotificationsEnabled: 'true',
      pushNotificationsEnabled: 'true',
    });

    await updateNotificationPreferences(formData);

    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ generalNotificationsEnabled: false, expenseNotificationsEnabled: true })
    );
    expect(updateTagMock).toHaveBeenCalledWith('notification-preferences-user-1');
  });

  it('enables push notifications, the flag that gates both desktop and mobile subscriptions', async () => {
    const formData = formDataWith({
      expenseNotificationsEnabled: 'true',
      investmentNotificationsEnabled: 'true',
      goalNotificationsEnabled: 'true',
      closingNotificationsEnabled: 'true',
      generalNotificationsEnabled: 'true',
      pushNotificationsEnabled: 'true',
    });

    await updateNotificationPreferences(formData);

    expect(updateSetMock).toHaveBeenCalledWith(expect.objectContaining({ pushNotificationsEnabled: true }));
  });

  it('disables push notifications when the checkbox is unchecked', async () => {
    const formData = formDataWith({
      expenseNotificationsEnabled: 'true',
      investmentNotificationsEnabled: 'true',
      goalNotificationsEnabled: 'true',
      closingNotificationsEnabled: 'true',
      generalNotificationsEnabled: 'true',
    });

    await updateNotificationPreferences(formData);

    expect(updateSetMock).toHaveBeenCalledWith(expect.objectContaining({ pushNotificationsEnabled: false }));
  });

  it('requires authentication before reading preferences', async () => {
    requireUserIdMock.mockRejectedValue(new Error('Unauthorized'));

    await expect(getNotificationPreferences()).rejects.toThrow('Unauthorized');
  });
});
