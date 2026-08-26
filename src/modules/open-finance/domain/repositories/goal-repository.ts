export type Goal = {
  id: string;
  userId: string;
  month: string;
  category: string | null;
  targetAmount: number;
  createdAt: string;
};

export type NewGoal = Omit<Goal, 'id' | 'createdAt'>;

export interface GoalRepository {
  findAllByUserIdAndMonth(userId: string, month: string): Promise<Goal[]>;
  upsert(data: NewGoal): Promise<Goal>;
}
