import type {
  GoalPrompt,
  GoalPromptRepository,
  NewGoalPrompt,
} from '../../../../modules/open-finance/domain/repositories/goal-prompt-repository';

export class FakeGoalPromptRepository implements GoalPromptRepository {
  private items: GoalPrompt[] = [];
  private idCounter = 1;

  async create(data: NewGoalPrompt): Promise<GoalPrompt> {
    const item: GoalPrompt = {
      id: String(this.idCounter++),
      userId: data.userId,
      telegramMessageId: data.telegramMessageId,
      answeredAt: null,
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  async findByTelegramMessageId(messageId: number): Promise<GoalPrompt | null> {
    return this.items.find((item) => item.telegramMessageId === messageId) ?? null;
  }

  async findLatestPendingByUserId(userId: string): Promise<GoalPrompt | null> {
    const matching = this.items
      .filter((item) => item.userId === userId && !item.answeredAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return matching[0] ?? null;
  }

  async markAnswered(id: string): Promise<GoalPrompt> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], answeredAt: new Date().toISOString() };
    return this.items[index];
  }
}
