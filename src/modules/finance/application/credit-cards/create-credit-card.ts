import type { CreditCard, NewCreditCardInput } from '../../domain/models/credit-card';
import type { EntryChangeNotifier } from '../../domain/ports/entry-change-notifier';
import type { CreditCardRepository } from '../../domain/repositories/credit-card-repository';
import { validateNewCreditCard } from '../../domain/services/validate-credit-card';

export class CreateCreditCardUseCase {
  constructor(
    private readonly cards: CreditCardRepository,
    private readonly notifier: EntryChangeNotifier
  ) {}

  async execute(userId: string, input: NewCreditCardInput): Promise<CreditCard> {
    validateNewCreditCard(input);
    const card = await this.cards.create({
      userId,
      name: input.name.trim(),
      lastDigits: input.lastDigits ?? null,
      creditLimit: input.creditLimit,
      closingDay: input.closingDay ?? null,
    });
    await this.notifier.notifyEntriesChanged(userId);
    return card;
  }
}
