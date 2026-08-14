import { eq } from 'drizzle-orm';
import { db } from '../../../../db/connection';
import { users } from '../../../../db/schema/users';
import { IUserRepository, NewUser, User } from '../../domain/repositories/IUserRepository';

export class UserDrizzleRepository implements IUserRepository {
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error('User not found');
    return user;
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async findAll(): Promise<User[]> {
    return db.select().from(users);
  }
}
