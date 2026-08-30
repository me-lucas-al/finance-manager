export type SavingsGoalStatus = 'active' | 'completed' | 'abandoned';

export type SavingsGoal = {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  status: SavingsGoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type NewSavingsGoal = Omit<
  SavingsGoal,
  'id' | 'createdAt' | 'updatedAt' | 'currentAmount' | 'status'
> & {
  currentAmount?: number;
  status?: SavingsGoalStatus;
};

export interface SavingsGoalRepository {
  findAllActiveByUserId(userId: string): Promise<SavingsGoal[]>;
  create(data: NewSavingsGoal): Promise<SavingsGoal>;
  update(id: string, patch: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>>): Promise<SavingsGoal>;
}
