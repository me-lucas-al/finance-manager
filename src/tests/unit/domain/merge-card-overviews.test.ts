import { describe, it, expect } from 'vitest';
import type { CreditCardOverview } from '@/modules/finance/domain/models/credit-card-overview';
import { mergeCardOverviews } from '@/modules/finance/domain/services/merge-card-overviews';

const overview = (total: number, limit: number, ids: string[]): CreditCardOverview => ({
  total,
  limit,
  usedPercentage: 0,
  cards: ids.map((id) => ({ id, name: id, digits: '', amount: 0 })),
});

describe('mergeCardOverviews', () => {
  it('sums totals and limits and recomputes the usage percentage', () => {
    const merged = mergeCardOverviews(overview(900, 3000, ['a']), overview(800, 4000, ['b', 'c']));

    expect(merged).toMatchObject({ total: 1700, limit: 7000, usedPercentage: 24 });
    expect(merged.cards.map((card) => card.id)).toEqual(['a', 'b', 'c']);
  });

  it('reports zero usage when no card has a limit', () => {
    expect(mergeCardOverviews(overview(0, 0, []), overview(0, 0, [])).usedPercentage).toBe(0);
  });
});
