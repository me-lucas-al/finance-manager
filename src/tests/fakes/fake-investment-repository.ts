import {
  InvestmentRepository,
  InvestmentPage,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(item);
    return item;
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
