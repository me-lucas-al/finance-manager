import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUserSettings, getUserSettings } from '../../../src/modules/users/presentation/actions/userSettingsActions';
import * as session from '../../../src/lib/session';

vi.mock('../../../src/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const mockGetUserSettings = vi.fn();
const mockCreateUserSettings = vi.fn();
const mockUpdateUserSettings = vi.fn();

vi.mock('../../../src/modules/users/application/useCases/UserSettingsService', () => {
  return {
    UserSettingsService: class MockUserSettingsService {
      getUserSettings = mockGetUserSettings;
      createUserSettings = mockCreateUserSettings;
      updateUserSettings = mockUpdateUserSettings;
    },
  };
});

vi.mock('../../../src/modules/users/infra/repositories/UserSettingsDrizzleRepository', () => {
  return {
    UserSettingsDrizzleRepository: class MockUserSettingsDrizzleRepository {},
  };
});

describe('userSettingsActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserSettings', () => {
    it('should fail if user is not authenticated', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue(null);

      const result = await getUserSettings();
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should get settings if authenticated', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetUserSettings.mockResolvedValue({ id: 's1', userId: 'u1' });

      const result = await getUserSettings();
      expect(result).toEqual({ success: true, data: { id: 's1', userId: 'u1' } });
    });

    it('should auto-create settings if not exist', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetUserSettings.mockResolvedValue(null);
      mockCreateUserSettings.mockResolvedValue({ id: 's2', userId: 'u1' });

      const result = await getUserSettings();
      expect(result).toEqual({ success: true, data: { id: 's2', userId: 'u1' } });
      expect(mockCreateUserSettings).toHaveBeenCalledWith({ userId: 'u1' });
    });
  });

  describe('updateUserSettings', () => {
    it('should fail if user is not authenticated', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue(null);

      const result = await updateUserSettings({ periodStartDay: 1 });
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should update settings if authenticated', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetUserSettings.mockResolvedValue({ id: 's1', userId: 'u1' });
      mockUpdateUserSettings.mockResolvedValue({ id: 's1', periodStartDay: 5 });

      const result = await updateUserSettings({ periodStartDay: 5 });
      expect(result).toEqual({ success: true, data: { id: 's1', periodStartDay: 5 } });
      expect(mockUpdateUserSettings).toHaveBeenCalledWith('u1', { periodStartDay: 5 });
    });
  });
});
