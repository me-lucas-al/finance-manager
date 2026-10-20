import { ParsedEntry } from '../../domain/parsers/parse-entry-message';
import { TransactionRepository, TransactionNecessity } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { IncomeRepository } from '../../domain/repositories/income-repository';
import { InvestmentRepository } from '../../domain/repositories/investment-repository';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { toPeriodReference } from '@/modules/periods/domain/period-reference';
import { ClassifyNecessityService } from '../services/classify-necessity-service';
import { ExpensePatternAnalyzer } from '../services/expense-pattern-analyzer';
import { SpendingAlert } from '../../domain/models/spending-patterns';
import { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { FixedLaunchLink } from '../../domain/models/fixed-entry';
import { dateAtNoon, toLocalDateString } from '@/lib/month';
import { assertValidEntryDate } from '../../domain/parsers/parse-entry-date';
import type { CardLinkValidator } from '../../domain/ports/card-link-validator';
import { assertCardLink } from '../credit-cards/assert-card-link';
import { buildNewExpense, buildNewIncome, buildNewInvestment } from '../services/entry-record-builders';

export type RegisteredEntryResult = {
  type: ParsedEntry['type'];
  category: string;
  description: string;
  amount: number;
  necessity?: TransactionNecessity;
  alerts: SpendingAlert[];
};

export type RegisterEntryOptions = { fixed?: FixedLaunchLink };

export class RegisterManualEntryUseCase {
  constructor(
    private transactionRepo: TransactionRepository,
    private incomeRepo: IncomeRepository,
    private investmentRepo: InvestmentRepository,
    private resolvePeriod: ResolveCurrentPeriodUseCase,
    private classifyNecessity: ClassifyNecessityService,
    private patternAnalyzer: ExpensePatternAnalyzer,
    private notifier: EntryChangeNotifier,
    private cardLinks: CardLinkValidator
  ) {}

  async execute(userId: string, entry: ParsedEntry, options: RegisterEntryOptions = {}): Promise<RegisteredEntryResult> {
    const dateString = entry.date ?? toLocalDateString(new Date());
    assertValidEntryDate(dateString);
    await assertCardLink(this.cardLinks, userId, entry.type, entry.creditCardId);
    const result = await this.persist(userId, entry, dateString, options);
    await this.notifier.notifyEntriesChanged(userId);
    return result;
  }

  private async persist(userId: string, entry: ParsedEntry, date: string, options: RegisterEntryOptions): Promise<RegisteredEntryResult> {
    if (entry.type === 'income') return this.persistIncome(userId, entry, date, options);
    if (entry.type === 'investment') return this.persistInvestment(userId, entry, date);
    return this.persistExpense(userId, entry, date, options);
  }

  private async persistIncome(userId: string, entry: ParsedEntry, date: string, options: RegisterEntryOptions): Promise<RegisteredEntryResult> {
    const reference = toPeriodReference(await this.resolvePeriod.execute(userId));
    await this.incomeRepo.create(buildNewIncome(userId, reference, entry, date, options.fixed));
    return { ...entry, alerts: [] };
  }

  private async persistInvestment(userId: string, entry: ParsedEntry, date: string): Promise<RegisteredEntryResult> {
    const reference = toPeriodReference(await this.resolvePeriod.execute(userId));
    await this.investmentRepo.create(buildNewInvestment(userId, reference, entry, date));
    return { ...entry, alerts: [] };
  }

  private async persistExpense(userId: string, entry: ParsedEntry, date: string, options: RegisterEntryOptions): Promise<RegisteredEntryResult> {
    const necessity = entry.necessity ?? (await this.classifyNecessity.execute(userId, entry.category, entry.description));
    const alerts = options.fixed ? [] : await this.patternAnalyzer.analyze(userId, entry, date.slice(0, 7));
    const reference = toPeriodReference(await this.resolvePeriod.forDate(userId, dateAtNoon(date)));
    await this.transactionRepo.create(buildNewExpense(userId, entry, date, necessity, reference, options.fixed));
    return { ...entry, necessity, alerts };
  }
}
