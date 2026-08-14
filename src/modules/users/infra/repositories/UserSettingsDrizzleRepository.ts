import { eq } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { userSettings } from '../../../../db/schema/userSettings';
import { IUserSettingsRepository, NewUserSettings, UserSettings } from '../../domain/repositories/IUserSettingsRepository';

export class UserSettingsDrizzleRepository implements IUserSettingsRepository {
  async create(data: NewUserSettings): Promise<UserSettings> {
    const [settings] = await db.insert(userSettings).values(data).returning();
    return settings;
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || null;
  }

  async update(userId: string, data: Partial<NewUserSettings>): Promise<UserSettings> {
    const [settings] = await db
      .update(userSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    if (!settings) throw new Error('User settings not found');
    return settings;
  }

  async delete(userId: string): Promise<void> {
    await db.delete(userSettings).where(eq(userSettings.userId, userId));
  }
}
