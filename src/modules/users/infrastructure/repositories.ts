import { SettingRepository, NewSetting } from '../domain/repositories/setting-repository';
import { db } from '../../../db';
import { userSettings } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export class DrizzleSettingRepository implements SettingRepository {
  async create(data: Omit<NewSetting, 'id'>) {
    const [result] = await db.insert(userSettings).values({ ...data, id: crypto.randomUUID() }).returning();
    return result;
  }
  async findById(id: string) {
    const [result] = await db.select().from(userSettings).where(eq(userSettings.id, id));
    return result ?? null;
  }
  async findByUserId(userId: string) {
    const [result] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return result ?? null;
  }
  async update(id: string, data: Partial<NewSetting>) {
    const [result] = await db.update(userSettings).set(data).where(eq(userSettings.id, id)).returning();
    return result;
  }
  async delete(id: string) {
    await db.delete(userSettings).where(eq(userSettings.id, id));
  }
}
