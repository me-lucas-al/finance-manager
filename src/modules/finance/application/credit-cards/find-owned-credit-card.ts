import { EntryNotFoundError } from '../../domain/models/entry-errors';
import type { CreditCard } from '../../domain/models/credit-card';
import type { CreditCardRepository } from '../../domain/repositories/credit-card-repository';

export async function findOwnedCreditCard(
  cards: CreditCardRepository,
  userId: string,
  creditCardId: string
): Promise<CreditCard> {
  const card = await cards.findById(userId, creditCardId);
  if (!card) throw new EntryNotFoundError('Cartão não encontrado');
  return card;
}
