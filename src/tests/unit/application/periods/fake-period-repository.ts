import { Period, NewPeriod, PeriodRepository } from '../../../../modules/periods/domain/repositories/period-repository';

export class FakePeriodRepository implements PeriodRepository {
  private items: Period[] = [];
  private idCounter = 1;

  async create(data: Omit<NewPeriod, 'id'>): Promise<Period> {
    const item: Period = {
      id: String(this.idCounter++),
      createdAt: new Date(),
      updatedAt: new Date(),
      closedAt: null,
      ...data,
    };
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<Period | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async update(id: string, data: Partial<NewPeriod>): Promise<Period> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
}
