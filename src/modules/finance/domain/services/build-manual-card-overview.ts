import type { CreditCardUsage } from '../models/credit-card';
import type { CreditCardOverview } from '../models/credit-card-overview';

export function buildManualCardOverview(usages: CreditCardUsage[]): CreditCardOverview {
  const total = usages.reduce((sum, usage) => sum + usage.used, 0);
  const limit = usages.reduce((sum, usage) => sum + usage.card.creditLimit, 0);
  return {
    source: 'manual',
    total,
    limit,
    usedPercentage: limit > 0 ? Math.round((total / limit) * 100) : 0,
    cards: usages.map(({ card, used, percentage }) => ({
      id: card.id,
      name: card.name,
      digits: card.lastDigits ? `•••• ${card.lastDigits}` : '',
      amount: used,
      limit: card.creditLimit,
      usedPercentage: percentage,
    })),
  };
}
