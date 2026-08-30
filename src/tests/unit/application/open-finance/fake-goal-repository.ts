import type {
  Goal,
  GoalRepository,
  NewGoal,
} from '../../../../modules/open-finance/domain/repositories/goal-repository';

export class FakeGoalRepository implements GoalRepository {
  private items: Goal[] = [];
  private idCounter = 1;

  async findAllByUserIdAndMonth(userId: string, month: string): Promise<Goal[]> {
    return this.items.filter((item) => item.userId === userId && item.month === month);
  }

  async upsert(data: NewGoal): Promise<Goal> {
    const index = this.items.findIndex(
      (item) => item.userId === data.userId && item.month === data.month && item.category === data.category,
    );
    if (index !== -1) {
      this.items[index] = { ...this.items[index], targetAmount: data.targetAmount };
      return this.items[index];
    }

    const item: Goal = { ...data, id: String(this.idCounter++), createdAt: new Date().toISOString() };
    this.items.push(item);
    return item;
  }
}
