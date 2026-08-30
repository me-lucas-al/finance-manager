import type {
  NewSavingsGoal,
  SavingsGoal,
  SavingsGoalRepository,
} from '../../../../modules/open-finance/domain/repositories/savings-goal-repository';

export class FakeSavingsGoalRepository implements SavingsGoalRepository {
  private items: SavingsGoal[] = [];
  private idCounter = 1;

  async findAllActiveByUserId(userId: string): Promise<SavingsGoal[]> {
    return this.items.filter((item) => item.userId === userId && item.status === 'active');
  }

  async create(data: NewSavingsGoal): Promise<SavingsGoal> {
    const now = new Date().toISOString();
    const item: SavingsGoal = {
      id: String(this.idCounter++),
      userId: data.userId,
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      targetDate: data.targetDate,
      status: data.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(item);
    return item;
  }

  async update(
    id: string,
    patch: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<SavingsGoal> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...patch, updatedAt: new Date().toISOString() };
    return this.items[index];
  }
}
