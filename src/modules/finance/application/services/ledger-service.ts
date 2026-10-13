import type { LedgerSource } from '../../domain/ports/ledger-source';
import type { LedgerEntry } from '../../domain/models/ledger-entry';
import { expenseToEntry, incomeToEntry, investmentToEntry, sortNewestFirst } from '../../domain/services/ledger-mapper';

export class LedgerService {
  constructor(private readonly source: LedgerSource) {}

  async load(userId: string): Promise<LedgerEntry[]> {
    const [transactions, incomes, investments] = await Promise.all([
      this.source.findAllTransactions(userId),
      this.source.findAllIncomes(userId),
      this.source.findAllInvestments(userId),
    ]);
    return sortNewestFirst([
      ...transactions.map(expenseToEntry),
      ...incomes.map(incomeToEntry),
      ...investments.map(investmentToEntry),
    ]);
  }
}
