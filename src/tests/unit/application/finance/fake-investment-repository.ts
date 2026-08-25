import { Investment, InvestmentRepository } from '../../../../modules/finance/domain/repositories/investment-repository';

export class FakeInvestmentRepository implements InvestmentRepository {
  private items: Investment[] = [];
  private idCounter = 1;

  async create(data: Omit<Investment, 'id'>): Promise<Investment> {
    const item = { ...data, id: String(this.idCounter++) } as Investment;
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<Investment | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async findAllByUserId(userId: string): Promise<Investment[]> {
    return this.items.filter(i => i.userId === userId);
  }
  async update(id: string, data: Partial<Investment>): Promise<Investment> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
  
}