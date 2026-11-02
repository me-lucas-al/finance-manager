import { describe, it, expect, vi } from 'vitest';
import { createCreditCardOverviewService } from '@/modules/finance/application/services/credit-card-overview-service';
import type { CreditCardUsage } from '@/modules/finance/domain/models/credit-card';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

const pluggyCards = {
  cardTotal: 900,
  cardLimit: 3000,
  cardUsedPercentage: 30,
  cards: [{ id: 'p1', name: 'Itaú', digits: '', amount: 900 }],
};

const manualUsage: CreditCardUsage[] = [
  {
    card: makeCreditCard({ id: 'm1', name: 'Nubank', lastDigits: '4321', creditLimit: 2000 }),
    used: 500,
    percentage: 25,
    cycle: { start: '2026-10-01', end: '2026-10-31' },
  },
  {
    card: makeCreditCard({ id: 'm2', name: 'Inter', lastDigits: null, creditLimit: 2000 }),
    used: 300,
    percentage: 15,
    cycle: { start: '2026-10-01', end: '2026-10-31' },
  },
];

const buildService = (usages: CreditCardUsage[]) => {
  const listUsage = vi.fn(async () => usages);
  return { service: createCreditCardOverviewService({ listUsage }), listUsage };
};

describe('credit card overview', () => {
  it('adds the manual cards to the ones imported from Pluggy', async () => {
    const { service, listUsage } = buildService(manualUsage);

    const overview = await service('user-1', pluggyCards);

    expect(listUsage).toHaveBeenCalledWith('user-1');
    expect(overview).toMatchObject({ total: 1700, limit: 7000, usedPercentage: 24 });
    expect(overview.cards.map((card) => card.id)).toEqual(['p1', 'm1', 'm2']);
  });

  it('describes each manual card with digits, limit and usage', async () => {
    const { service } = buildService(manualUsage);

    const { cards } = await service('user-1', pluggyCards);

    expect(cards[1]).toEqual({
      id: 'm1',
      name: 'Nubank',
      digits: '•••• 4321',
      amount: 500,
      limit: 2000,
      usedPercentage: 25,
    });
    expect(cards[2].digits).toBe('');
  });

  it('keeps only the Pluggy cards when there are no manual ones', async () => {
    const { service } = buildService([]);

    expect(await service('user-1', pluggyCards)).toEqual({
      total: 900,
      limit: 3000,
      usedPercentage: 30,
      cards: pluggyCards.cards,
    });
  });

  it('keeps only the manual cards when the bank has none', async () => {
    const { service } = buildService(manualUsage);

    const overview = await service('user-1', { cardTotal: 0, cardLimit: 0, cardUsedPercentage: 0, cards: [] });

    expect(overview).toMatchObject({ total: 800, limit: 4000, usedPercentage: 20 });
    expect(overview.cards.map((card) => card.id)).toEqual(['m1', 'm2']);
  });

  it('returns an empty overview when there are no cards at all', async () => {
    const { service } = buildService([]);

    expect(await service('user-1', { cardTotal: 0, cardLimit: 0, cardUsedPercentage: 0, cards: [] })).toEqual({
      total: 0,
      limit: 0,
      usedPercentage: 0,
      cards: [],
    });
  });
});
