import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { IncomeRepository } from '../../domain/repositories/income-repository';
import type { InvestmentRepository } from '../../domain/repositories/investment-repository';
import type { EntryRef } from '../../domain/models/entry-changes';
import { EntryNotFoundError } from '../../domain/models/entry-errors';

export class OwnedEntryGuard {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly incomeRepo: IncomeRepository,
    private readonly investmentRepo: InvestmentRepository
  ) {}

  async assertOwned(userId: string, ref: EntryRef): Promise<void> {
    const owner = await this.findOwnerId(ref);
    if (owner !== userId) throw new EntryNotFoundError();
  }

  private async findOwnerId(ref: EntryRef): Promise<string | undefined> {
    if (ref.kind === 'expense') return (await this.transactionRepo.findById(ref.id))?.userId;
    if (ref.kind === 'income') return (await this.incomeRepo.findById(ref.id))?.userId;
    return (await this.investmentRepo.findById(ref.id))?.userId;
  }
}
