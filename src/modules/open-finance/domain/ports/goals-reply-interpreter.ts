export type SavingsGoalUpdate = {
  title: string;
  targetAmount: number | null;
  targetDate: string | null;
  contributionAmount: number | null;
};

export type GoalsReplyInterpretation = {
  monthlyGeneralTarget: number | null;
  monthlyCategoryTargets: { category: string; amount: number }[];
  savingsGoalUpdates: SavingsGoalUpdate[];
};

export type GoalsReplyInput = {
  replyText: string;
  categories: string[];
  existingSavingsGoals: string[];
};

export interface GoalsReplyInterpreter {
  interpret(input: GoalsReplyInput): Promise<GoalsReplyInterpretation>;
}
