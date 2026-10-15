import type { CardLinkValidator } from '../../domain/ports/card-link-validator';
import type { CreditCardRepository } from '../../domain/repositories/credit-card-repository';
import { findOwnedCreditCard } from './find-owned-credit-card';

export class CreditCardLinkGuard implements CardLinkValidator {
  constructor(private readonly cards: CreditCardRepository) {}

  async assertUsable(userId: string, creditCardId: string): Promise<void> {
    await findOwnedCreditCard(this.cards, userId, creditCardId);
  }
}
