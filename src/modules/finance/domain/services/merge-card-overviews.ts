import type { CreditCardOverview } from '../models/credit-card-overview';

export function mergeCardOverviews(first: CreditCardOverview, second: CreditCardOverview): CreditCardOverview {
  const total = first.total + second.total;
  const limit = first.limit + second.limit;
  return {
    total,
    limit,
    usedPercentage: limit > 0 ? Math.round((total / limit) * 100) : 0,
    cards: [...first.cards, ...second.cards],
  };
}
