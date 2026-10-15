import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { CreditCardRepository } from '../../domain/repositories/credit-card-repository';
import { findOwnedCreditCard } from './find-owned-credit-card';

export class DeleteCreditCardUseCase {
  constructor(
    private readonly cards: CreditCardRepository,
    private readonly notifier: EntryChangeNotifier
  ) {}

  async execute(userId: string, creditCardId: string): Promise<void> {
    await findOwnedCreditCard(this.cards, userId, creditCardId);
    await this.cards.delete(userId, creditCardId);
    await this.notifier.notifyEntriesChanged(userId);
  }
}
