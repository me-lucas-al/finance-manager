import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../../../../db/schema/users';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export interface IUserRepository {
  create(data: NewUser): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<NewUser>): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}
