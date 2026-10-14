import type { NewUser, User } from '../models/user';

export type { NewUser, User };

export interface UserRepository {
  create(data: Omit<NewUser, 'id'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<NewUser>): Promise<User>;
  delete(id: string): Promise<void>;
}
