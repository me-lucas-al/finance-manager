import { toLocalDateString } from '@/lib/month';
import type { CreditCardUsage } from '../../domain/models/credit-card';
import type { CardSpendingSource } from '../../domain/ports/card-spending-source';
import type { CreditCardRepository } from '../../domain/repositories/credit-card-repository';
import { buildCreditCardUsage } from '../../domain/services/build-credit-card-usage';
import { resolveBillingCycle } from '../../domain/services/resolve-billing-cycle';

export class ListCreditCardUsageUseCase {
  constructor(
    private readonly cards: CreditCardRepository,
    private readonly spending: CardSpendingSource,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async execute(userId: string): Promise<CreditCardUsage[]> {
    const cards = await this.cards.findAllByUserId(userId);
    if (cards.length === 0) return [];
    const today = toLocalDateString(this.clock());
    const cycles = cards.map((card) => resolveBillingCycle(card.closingDay, today));
    const starts = cycles.map((cycle) => cycle.start).sort();
    const ends = cycles.map((cycle) => cycle.end).sort();
    const expenses = await this.spending.listCardExpenses(userId, { from: starts[0], to: ends[ends.length - 1] });
    return cards.map((card) => buildCreditCardUsage(card, expenses, today));
  }
}
