import { User, NewUser, UserRepository } from '../../../../modules/users/domain/repositories/user-repository';

export class FakeUserRepository implements UserRepository {
  private items: User[] = [];
  private idCounter = 1;

  async create(data: Omit<NewUser, 'id'>): Promise<User> {
    const item: User = {
      id: String(this.idCounter++),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<User | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.items.find(i => i.email === email) || null;
  }
  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
}
