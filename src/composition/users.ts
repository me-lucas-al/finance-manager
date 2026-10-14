import { UpdateSettingUseCase } from '@/modules/users/application/use-cases/manage-setting';
import { DrizzleSettingRepository, DrizzleUserRepository } from '@/modules/users/infrastructure/repositories';

export const userRepository = new DrizzleUserRepository();
export const settingRepository = new DrizzleSettingRepository();
export const updateSetting = new UpdateSettingUseCase(settingRepository);
