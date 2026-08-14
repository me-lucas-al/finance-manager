import { UserSettingsService } from '@/modules/users/application/useCases/UserSettingsService';
import { UserSettingsDrizzleRepository } from '@/modules/users/infra/repositories/UserSettingsDrizzleRepository';
import { cacheTag } from 'next/cache';

const getUserSettingsService = () => {
  return new UserSettingsService(new UserSettingsDrizzleRepository());
};

export async function getUserSettingsData(userId: string) {
  'use cache';
  cacheTag(`user-settings-${userId}`);
  
  const service = getUserSettingsService();
  const settings = await service.getUserSettings(userId);
  
  return settings;
}
