import { definedOnly } from './defined-only';
import {
  InvestmentRepository,
  InvestmentPage,
  InvestmentUpdate,
  NewInvestment,
  Investment,
} from '../../modules/finance/domain/repositories/investment-repository';

export class FakeInvestmentRepository implements InvestmentRepository {
  public items: Investment[] = [];
  private counter = 1;

  async create(data: NewInvestment): Promise<Investment> {
    const item: Investment = {
      id: data.id ?? String(this.counter++),
      userId: data.userId,
      periodId: data.periodId,
      description: data.description,
      amount: String(data.amount),
      type: data.type,
      date: data.date,
      externalId: null,
      referenceMonth: data.referenceMonth ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(item);
    return item;
  }

  async findById(id: string): Promise<Investment | null> {
    return this.items.find((i) => i.id === id) ?? null;
  }

  async update(id: string, data: InvestmentUpdate): Promise<Investment> {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Investment not found');
    const { amount, ...rest } = data;
    const updated = { ...this.items[index], ...definedOnly(rest), ...(amount === undefined ? {} : { amount: String(amount) }), updatedAt: new Date() };
    this.items[index] = updated;
    return updated;
  }

  async findLatestByUserId(userId: string): Promise<Investment | null> {
    const list = this.items.filter((i) => i.userId === userId);
    return list[list.length - 1] ?? null;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
  }

  async findPageByUserId(userId: string): Promise<InvestmentPage> {
    const list = this.items.filter((i) => i.userId === userId);
    return { rows: list, total: list.length };
  }
}
