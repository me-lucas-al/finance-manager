import { Period, PeriodRepository } from '../../../../modules/periods/domain/repositories/period-repository';

export class FakePeriodRepository implements PeriodRepository {
  private items: Period[] = [];
  private idCounter = 1;

  async create(data: Omit<Period, 'id'>): Promise<Period> {
    const item = { ...data, id: String(this.idCounter++) } as Period;
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<Period | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async update(id: string, data: Partial<Period>): Promise<Period> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
  
}