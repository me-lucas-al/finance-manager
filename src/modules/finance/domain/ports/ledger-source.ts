import type { Transaction } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { Income } from '../repositories/income-repository';
import type { Investment } from '../repositories/investment-repository';

export interface LedgerSource {
  findAllTransactions(userId: string): Promise<Transaction[]>;
  findAllIncomes(userId: string): Promise<Income[]>;
  findAllInvestments(userId: string): Promise<Investment[]>;
}
