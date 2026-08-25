import { Income, IncomeRepository } from '../../../../modules/finance/domain/repositories/income-repository';

export class FakeIncomeRepository implements IncomeRepository {
  private items: Income[] = [];
  private idCounter = 1;

  async create(data: Omit<Income, 'id'>): Promise<Income> {
    const item = { ...data, id: String(this.idCounter++) } as Income;
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<Income | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async findAllByUserId(userId: string): Promise<Income[]> {
    return this.items.filter(i => i.userId === userId);
  }
  async update(id: string, data: Partial<Income>): Promise<Income> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
  
}