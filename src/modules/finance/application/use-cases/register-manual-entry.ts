import { ParsedEntry } from '../../domain/parsers/parse-entry-message';
import { TransactionRepository, TransactionNecessity } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { IncomeRepository } from '../../domain/repositories/income-repository';
import { InvestmentRepository } from '../../domain/repositories/investment-repository';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { ClassifyNecessityService } from '../services/classify-necessity-service';
import { detectSpendingPatterns } from '../../domain/services/detect-spending-patterns';
import { SpendingAlert } from '../../domain/models/spending-patterns';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';

export type RegisteredEntryResult = {
  type: ParsedEntry['type'];
  category: string;
  description: string;
  amount: number;
  necessity?: TransactionNecessity;
  alerts: SpendingAlert[];
};

export class RegisterManualEntryUseCase {
  constructor(
    private transactionRepo: TransactionRepository,
    private incomeRepo: IncomeRepository,
    private investmentRepo: InvestmentRepository,
    private resolvePeriod: ResolveCurrentPeriodUseCase,
    private classifyNecessity: ClassifyNecessityService,
    private goalRepo?: GoalRepository
  ) {}

  async execute(userId: string, entry: ParsedEntry): Promise<RegisteredEntryResult> {
    if (entry.type === 'income') {
      const period = await this.resolvePeriod.execute(userId);
      await this.incomeRepo.create({
        userId,
        periodId: period.id,
        amount: entry.amount,
        description: entry.description,
        category: entry.category,
        receivedAt: new Date(),
      });
      return { ...entry, alerts: [] };
    }

    if (entry.type === 'investment') {
      const period = await this.resolvePeriod.execute(userId);
      await this.investmentRepo.create({
        userId,
        periodId: period.id,
        amount: entry.amount,
        description: entry.description,
        type: entry.category,
        date: new Date(),
      });
      return { ...entry, alerts: [] };
    }

    const necessity = await this.classifyNecessity.execute(userId, entry.category, entry.description);
    const recent = await this.transactionRepo.findAllByUserId(userId, { limit: 30 });
    const month = new Date().toISOString().slice(0, 7) + '-01';
    let categoryLimit: number | undefined;
    if (this.goalRepo) {
      const goals = await this.goalRepo.findAllByUserIdAndMonth(userId, month);
      const match = goals.find((g) => g.category?.toLowerCase() === entry.category.toLowerCase());
      categoryLimit = match?.targetAmount;
    }

    const patternReport = detectSpendingPatterns({
      newAmount: entry.amount,
      category: entry.category,
      recentTransactions: recent,
      categoryLimit,
    });

    await this.transactionRepo.create({
      userId,
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Manual',
      amount: entry.amount,
      description: entry.description,
      occurredAt: new Date().toISOString().slice(0, 10),
      category: entry.category,
      categorySuggested: null,
      reason: null,
      status: 'categorized',
      source: 'manual',
      necessity,
      telegramQuestionMessageId: null,
    });

    return { ...entry, necessity, alerts: patternReport.alerts };
  }
}
