import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { users } from '@/db/schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export interface UserRepository {
  create(data: Omit<NewUser, 'id'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<NewUser>): Promise<User>;
  delete(id: string): Promise<void>;
}
