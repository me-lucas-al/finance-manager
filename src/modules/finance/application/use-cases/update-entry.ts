import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { IncomeRepository } from '../../domain/repositories/income-repository';
import type { InvestmentRepository } from '../../domain/repositories/investment-repository';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import { validateEntryChanges, type EntryChanges, type EntryRef } from '../../domain/models/entry-changes';
import { dateAtNoon } from '@/lib/month';
import { OwnedEntryGuard } from '../services/owned-entry-guard';
import { noopCardLinkValidator, type CardLinkValidator } from '../../domain/ports/card-link-validator';
import { assertCardLink } from '../credit-cards/assert-card-link';
import { ClassifyNecessityService } from '../services/classify-necessity-service';

export class UpdateEntryUseCase {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly incomeRepo: IncomeRepository,
    private readonly investmentRepo: InvestmentRepository,
    private readonly guard: OwnedEntryGuard,
    private readonly classifyNecessity: ClassifyNecessityService,
    private readonly notifier: EntryChangeNotifier,
    private readonly cardLinks: CardLinkValidator = noopCardLinkValidator
  ) {}

  async execute(userId: string, ref: EntryRef, changes: EntryChanges): Promise<void> {
    validateEntryChanges(changes);
    await this.guard.assertOwned(userId, ref);
    await assertCardLink(this.cardLinks, userId, ref.kind, changes.creditCardId);
    await this.updateByKind(userId, ref, changes);
    await this.notifier.notifyEntriesChanged(userId);
  }

  private async updateByKind(userId: string, ref: EntryRef, changes: EntryChanges): Promise<void> {
    const { amount, description, category, date } = changes;
    const movedAt = date ? dateAtNoon(date) : undefined;
    if (ref.kind === 'income') {
      await this.incomeRepo.update(ref.id, { amount, description, category, receivedAt: movedAt });
      return;
    }
    if (ref.kind === 'investment') {
      await this.investmentRepo.update(ref.id, { amount, description, type: category, date: movedAt });
      return;
    }
    await this.updateExpense(userId, ref.id, changes);
  }

  private async updateExpense(userId: string, id: string, changes: EntryChanges): Promise<void> {
    const current = await this.transactionRepo.findById(id);
    const category = changes.category ?? current?.category ?? 'Outros';
    const description = changes.description ?? current?.description ?? '';
    const reclassify = changes.category !== undefined || changes.description !== undefined;
    await this.transactionRepo.update(id, {
      amount: changes.amount,
      description: changes.description,
      category: changes.category,
      occurredAt: changes.date,
      creditCardId: changes.creditCardId,
      necessity: changes.necessity ?? (reclassify ? await this.classifyNecessity.execute(userId, category, description) : undefined),
    });
  }
}
