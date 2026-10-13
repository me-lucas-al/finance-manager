import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { IncomeRepository } from '../../domain/repositories/income-repository';
import type { InvestmentRepository } from '../../domain/repositories/investment-repository';
import type { EntryRef } from '../../domain/models/entry-changes';

export type LatestEntry = {
  ref: EntryRef;
  description: string;
  amount: number;
  createdAt: number;
};

export class LatestEntryFinder {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly incomeRepo: IncomeRepository,
    private readonly investmentRepo: InvestmentRepository
  ) {}

  async find(userId: string): Promise<LatestEntry | null> {
    const [expense, income, investment] = await Promise.all([
      this.transactionRepo.findLatestByUserId(userId),
      this.incomeRepo.findLatestByUserId(userId),
      this.investmentRepo.findLatestByUserId(userId),
    ]);

    const candidates: Array<LatestEntry | null> = [
      expense && expense.source === 'manual'
        ? { ref: { kind: 'expense', id: expense.id }, description: expense.description, amount: expense.amount, createdAt: new Date(expense.createdAt).getTime() }
        : null,
      income
        ? { ref: { kind: 'income', id: income.id }, description: income.description, amount: Number(income.amount), createdAt: new Date(income.createdAt).getTime() }
        : null,
      investment
        ? { ref: { kind: 'investment', id: investment.id }, description: investment.description, amount: Number(investment.amount), createdAt: new Date(investment.createdAt).getTime() }
        : null,
    ];

    const present = candidates.filter((candidate): candidate is LatestEntry => candidate !== null);
    return present.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  }
}
