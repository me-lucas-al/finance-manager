import { IUserSettingsRepository, NewUserSettings, UserSettings } from '../../domain/repositories/IUserSettingsRepository';

export class UserSettingsService {
  constructor(private readonly userSettingsRepository: IUserSettingsRepository) {}

  async createUserSettings(data: NewUserSettings): Promise<UserSettings> {
    const existing = await this.userSettingsRepository.findByUserId(data.userId);
    if (existing) {
      throw new Error('User settings already exist');
    }
    return this.userSettingsRepository.create(data);
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.userSettingsRepository.findByUserId(userId);
  }

  async updateUserSettings(userId: string, data: Partial<NewUserSettings>): Promise<UserSettings> {
    return this.userSettingsRepository.update(userId, data);
  }

  async deleteUserSettings(userId: string): Promise<void> {
    return this.userSettingsRepository.delete(userId);
  }
}
