import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { detectSpendingPatterns } from '../../domain/services/detect-spending-patterns';
import type { SpendingAlert } from '../../domain/models/spending-patterns';

const RECENT_TRANSACTIONS_WINDOW = 30;

export type ExpenseToAnalyze = { amount: number; category: string };

export class ExpensePatternAnalyzer {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly goalRepo?: GoalRepository
  ) {}

  async analyze(userId: string, expense: ExpenseToAnalyze, monthKey: string): Promise<SpendingAlert[]> {
    const recent = await this.transactionRepo.findAllByUserId(userId, { limit: RECENT_TRANSACTIONS_WINDOW });
    const categoryLimit = await this.findCategoryLimit(userId, expense.category, monthKey);
    const report = detectSpendingPatterns({
      newAmount: expense.amount,
      category: expense.category,
      recentTransactions: recent,
      categoryLimit,
      referenceMonth: monthKey,
    });
    return report.alerts;
  }

  private async findCategoryLimit(userId: string, category: string, monthKey: string): Promise<number | undefined> {
    if (!this.goalRepo) return undefined;
    const goals = await this.goalRepo.findAllByUserIdAndMonth(userId, `${monthKey}-01`);
    return goals.find((goal) => goal.category?.toLowerCase() === category.toLowerCase())?.targetAmount;
  }
}
