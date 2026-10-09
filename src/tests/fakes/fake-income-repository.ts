import {
  IncomeRepository,
  IncomePage,
  NewIncome,
  Income,
} from '../../modules/finance/domain/repositories/income-repository';

export class FakeIncomeRepository implements IncomeRepository {
  public items: Income[] = [];
  private counter = 1;

  async create(data: NewIncome): Promise<Income> {
    const item: Income = {
      id: data.id ?? String(this.counter++),
      userId: data.userId,
      periodId: data.periodId,
      description: data.description,
      amount: String(data.amount),
      category: data.category,
      receivedAt: data.receivedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(item);
    return item;
  }

  async findLatestByUserId(userId: string): Promise<Income | null> {
    const list = this.items.filter((i) => i.userId === userId);
    return list[list.length - 1] ?? null;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
  }

  async findPageByUserId(userId: string): Promise<IncomePage> {
    const list = this.items.filter((i) => i.userId === userId);
    return { rows: list, total: list.length };
  }
}
