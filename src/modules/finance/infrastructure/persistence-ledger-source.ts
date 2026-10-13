import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { incomes, investments } from '@/db/schema';
import type { LedgerSource } from '../domain/ports/ledger-source';
import type { Transaction, TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';

const TRANSACTION_PAGE_SIZE = 1000;

export class PersistenceLedgerSource implements LedgerSource {
  constructor(private readonly transactionRepo: TransactionRepository) {}

  async findAllTransactions(userId: string): Promise<Transaction[]> {
    const all: Transaction[] = [];
    for (let offset = 0; ; offset += TRANSACTION_PAGE_SIZE) {
      const page = await this.transactionRepo.findAllByUserId(userId, { limit: TRANSACTION_PAGE_SIZE, offset });
      all.push(...page);
      if (page.length < TRANSACTION_PAGE_SIZE) return all;
    }
  }

  findAllIncomes(userId: string) {
    return db.select().from(incomes).where(eq(incomes.userId, userId));
  }

  findAllInvestments(userId: string) {
    return db.select().from(investments).where(eq(investments.userId, userId));
  }
}
