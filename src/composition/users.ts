import { UpdateSettingUseCase } from '@/modules/users/application/use-cases/manage-setting';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/drizzle-setting-repository';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/drizzle-user-repository';

export const userRepository = new DrizzleUserRepository();
export const settingRepository = new DrizzleSettingRepository();
export const updateSetting = new UpdateSettingUseCase(settingRepository);
