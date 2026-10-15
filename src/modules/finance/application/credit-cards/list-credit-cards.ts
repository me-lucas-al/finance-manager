import type { CreditCard } from '../../domain/models/credit-card';
import type { CreditCardRepository } from '../../domain/repositories/credit-card-repository';

export class ListCreditCardsUseCase {
  constructor(private readonly cards: CreditCardRepository) {}

  execute(userId: string): Promise<CreditCard[]> {
    return this.cards.findAllByUserId(userId);
  }
}
