import { User, UserRepository } from '../../../../modules/users/domain/repositories/user-repository';

export class FakeUserRepository implements UserRepository {
  private items: User[] = [];
  private idCounter = 1;

  async create(data: Omit<User, 'id'>): Promise<User> {
    const item = { ...data, id: String(this.idCounter++) } as User;
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<User | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async update(id: string, data: Partial<User>): Promise<User> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
  
}