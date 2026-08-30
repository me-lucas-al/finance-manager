export type GoalPrompt = {
  id: string;
  userId: string;
  telegramMessageId: number;
  answeredAt: string | null;
  createdAt: string;
};

export type NewGoalPrompt = Omit<GoalPrompt, 'id' | 'createdAt' | 'answeredAt'>;

export interface GoalPromptRepository {
  create(data: NewGoalPrompt): Promise<GoalPrompt>;
  findByTelegramMessageId(messageId: number): Promise<GoalPrompt | null>;
  findLatestPendingByUserId(userId: string): Promise<GoalPrompt | null>;
  markAnswered(id: string): Promise<GoalPrompt>;
}
