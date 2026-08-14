import { describe, it, expect, beforeEach } from 'vitest';
import { UserSettingsService } from './UserSettingsService';
import { IUserSettingsRepository, NewUserSettings, UserSettings } from '../../domain/repositories/IUserSettingsRepository';

class MockUserSettingsRepository implements IUserSettingsRepository {
  private settings: UserSettings[] = [];

  async create(data: NewUserSettings): Promise<UserSettings> {
    const setting: UserSettings = {
      id: data.id ?? Math.random().toString(),
      userId: data.userId,
      periodStartDay: data.periodStartDay ?? 15,
      periodEndDay: data.periodEndDay ?? 14,
      maxExpensesPercentage: data.maxExpensesPercentage ?? 80,
      minInvestmentPercentage: data.minInvestmentPercentage ?? 20,
      expenseCategories: data.expenseCategories ?? [],
      investmentTypes: data.investmentTypes ?? [],
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.settings.push(setting);
    return setting;
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    return this.settings.find((s) => s.userId === userId) || null;
  }

  async update(userId: string, data: Partial<NewUserSettings>): Promise<UserSettings> {
    const index = this.settings.findIndex((s) => s.userId === userId);
    if (index === -1) throw new Error('User settings not found');
    this.settings[index] = { ...this.settings[index], ...data, updatedAt: new Date() };
    return this.settings[index];
  }

  async delete(userId: string): Promise<void> {
    this.settings = this.settings.filter((s) => s.userId !== userId);
  }
}

describe('UserSettingsService', () => {
  let repository: MockUserSettingsRepository;
  let service: UserSettingsService;

  beforeEach(() => {
    repository = new MockUserSettingsRepository();
    service = new UserSettingsService(repository);
  });

  it('should create user settings', async () => {
    const settings = await service.createUserSettings({
      userId: 'user-1',
    });

    expect(settings).toHaveProperty('id');
    expect(settings.periodStartDay).toBe(15);
  });

  it('should update user settings', async () => {
    await service.createUserSettings({
      userId: 'user-1',
    });

    const updated = await service.updateUserSettings('user-1', { maxExpensesPercentage: 70 });
    expect(updated.maxExpensesPercentage).toBe(70);
  });

  it('should get user settings by user id', async () => {
    await service.createUserSettings({
      userId: 'user-1',
    });

    const settings = await service.getUserSettings('user-1');
    expect(settings?.userId).toBe('user-1');
  });

  it('should delete user settings', async () => {
    await service.createUserSettings({
      userId: 'user-1',
    });

    await service.deleteUserSettings('user-1');
    const settings = await service.getUserSettings('user-1');
    expect(settings).toBeNull();
  });

  it('should throw error if settings already exist', async () => {
    await service.createUserSettings({
      userId: 'user-1',
    });

    await expect(
      service.createUserSettings({ userId: 'user-1' })
    ).rejects.toThrow('User settings already exist');
  });
});
