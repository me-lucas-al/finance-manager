import type { CreditCard, CreditCardChanges } from '../../domain/models/credit-card';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { CreditCardRepository } from '../../domain/repositories/credit-card-repository';
import { validateCreditCardChanges } from '../../domain/services/validate-credit-card';
import { findOwnedCreditCard } from './find-owned-credit-card';

export class UpdateCreditCardUseCase {
  constructor(
    private readonly cards: CreditCardRepository,
    private readonly notifier: EntryChangeNotifier
  ) {}

  async execute(userId: string, creditCardId: string, changes: CreditCardChanges): Promise<CreditCard> {
    validateCreditCardChanges(changes);
    await findOwnedCreditCard(this.cards, userId, creditCardId);
    const updated = await this.cards.update(userId, creditCardId, {
      ...changes,
      name: changes.name?.trim(),
    });
    await this.notifier.notifyEntriesChanged(userId);
    return updated;
  }
}
