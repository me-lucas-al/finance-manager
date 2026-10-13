import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { IncomeRepository } from '../../domain/repositories/income-repository';
import type { InvestmentRepository } from '../../domain/repositories/investment-repository';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { EntryRef } from '../../domain/models/entry-changes';
import { OwnedEntryGuard } from '../services/owned-entry-guard';

export class DeleteEntryUseCase {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly incomeRepo: IncomeRepository,
    private readonly investmentRepo: InvestmentRepository,
    private readonly guard: OwnedEntryGuard,
    private readonly notifier: EntryChangeNotifier
  ) {}

  async execute(userId: string, ref: EntryRef): Promise<void> {
    await this.guard.assertOwned(userId, ref);
    await this.deleteByKind(ref);
    await this.notifier.notifyEntriesChanged(userId);
  }

  private async deleteByKind(ref: EntryRef): Promise<void> {
    if (ref.kind === 'expense') return this.transactionRepo.delete(ref.id);
    if (ref.kind === 'income') return this.incomeRepo.delete(ref.id);
    return this.investmentRepo.delete(ref.id);
  }
}
