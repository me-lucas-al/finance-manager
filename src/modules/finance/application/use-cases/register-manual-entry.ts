import { ParsedEntry } from '../../domain/parsers/parse-entry-message';
import { TransactionRepository, TransactionNecessity } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { IncomeRepository } from '../../domain/repositories/income-repository';
import { InvestmentRepository } from '../../domain/repositories/investment-repository';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { ClassifyNecessityService } from '../services/classify-necessity-service';
import { ExpensePatternAnalyzer } from '../services/expense-pattern-analyzer';
import { SpendingAlert } from '../../domain/models/spending-patterns';
import { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import { dateAtNoon, toLocalDateString } from '@/lib/month';
import { assertValidEntryDate } from '../../domain/parsers/parse-entry-date';

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
    private patternAnalyzer: ExpensePatternAnalyzer,
    private notifier: EntryChangeNotifier
  ) {}

  async execute(userId: string, entry: ParsedEntry): Promise<RegisteredEntryResult> {
    const dateString = entry.date ?? toLocalDateString(new Date());
    assertValidEntryDate(dateString);
    const result = await this.persist(userId, entry, dateString);
    await this.notifier.notifyEntriesChanged(userId);
    return result;
  }

  private async persist(userId: string, entry: ParsedEntry, dateString: string): Promise<RegisteredEntryResult> {
    if (entry.type === 'income') return this.persistIncome(userId, entry, dateString);
    if (entry.type === 'investment') return this.persistInvestment(userId, entry, dateString);
    return this.persistExpense(userId, entry, dateString);
  }

  private async persistIncome(userId: string, entry: ParsedEntry, dateString: string): Promise<RegisteredEntryResult> {
    const period = await this.resolvePeriod.execute(userId);
    await this.incomeRepo.create({
      userId,
      periodId: period.id,
      amount: entry.amount,
      description: entry.description,
      category: entry.category,
      receivedAt: dateAtNoon(dateString),
    });
    return { ...entry, alerts: [] };
  }

  private async persistInvestment(userId: string, entry: ParsedEntry, dateString: string): Promise<RegisteredEntryResult> {
    const period = await this.resolvePeriod.execute(userId);
    await this.investmentRepo.create({
      userId,
      periodId: period.id,
      amount: entry.amount,
      description: entry.description,
      type: entry.category,
      date: dateAtNoon(dateString),
    });
    return { ...entry, alerts: [] };
  }

  private async persistExpense(userId: string, entry: ParsedEntry, dateString: string): Promise<RegisteredEntryResult> {
    const necessity = await this.classifyNecessity.execute(userId, entry.category, entry.description);
    const alerts = await this.patternAnalyzer.analyze(userId, entry, dateString.slice(0, 7));
    await this.transactionRepo.create({
      userId,
      pluggyTransactionId: null,
      accountId: null,
      bank: 'Manual',
      amount: entry.amount,
      description: entry.description,
      occurredAt: dateString,
      category: entry.category,
      categorySuggested: null,
      reason: null,
      status: 'categorized',
      source: 'manual',
      necessity,
      telegramQuestionMessageId: null,
    });
    return { ...entry, necessity, alerts };
  }
}
