import { Setting, SettingRepository } from '../../../../modules/users/domain/repositories/setting-repository';

export class FakeSettingRepository implements SettingRepository {
  private items: Setting[] = [];
  private idCounter = 1;

  async create(data: Omit<Setting, 'id'>): Promise<Setting> {
    const item = { ...data, id: String(this.idCounter++) } as Setting;
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<Setting | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async update(id: string, data: Partial<Setting>): Promise<Setting> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
  
  async findByUserId(userId: string): Promise<Setting | null> {
    return this.items.find(i => i.userId === userId) || null;
  }
  
}