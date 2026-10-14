import { SettingRepository, NewSetting } from '../domain/repositories/setting-repository';
import { UserRepository, NewUser } from '../domain/repositories/user-repository';
import { db } from '../../../db';
import { userSettings, users } from '../../../db/schema';
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

export class DrizzleUserRepository implements UserRepository {
  async create(data: Omit<NewUser, 'id'>) {
    const [result] = await db.insert(users).values({ ...data, id: crypto.randomUUID() }).returning();
    return result;
  }
  async findById(id: string) {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result ?? null;
  }
  async findByEmail(email: string) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result ?? null;
  }
  async update(id: string, data: Partial<NewUser>) {
    const [result] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result;
  }
  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id));
  }
}
