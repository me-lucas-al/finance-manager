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

const noPluggyCards = { cardTotal: 0, cardLimit: 0, cardUsedPercentage: 0, cards: [] };

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

const emptyOverview = { total: 0, limit: 0, usedPercentage: 0, cards: [] };

const buildService = (usages: CreditCardUsage[]) => {
  const listUsage = vi.fn(async () => usages);
  return { service: createCreditCardOverviewService({ listUsage }), listUsage };
};

describe('credit card overview', () => {
  it('keeps the bank cards and the manual cards in separate groups', async () => {
    const { service, listUsage } = buildService(manualUsage);

    const overview = await service('user-1', pluggyCards);

    expect(listUsage).toHaveBeenCalledWith('user-1');
    expect(overview.connected).toEqual({ total: 900, limit: 3000, usedPercentage: 30, cards: pluggyCards.cards });
    expect(overview.manual).toMatchObject({ total: 800, limit: 4000, usedPercentage: 20 });
    expect(overview.manual.cards.map((card) => card.id)).toEqual(['m1', 'm2']);
  });

  it('describes each manual card with digits, limit and usage', async () => {
    const { service } = buildService(manualUsage);

    const { manual } = await service('user-1', pluggyCards);

    expect(manual.cards[0]).toEqual({
      id: 'm1',
      name: 'Nubank',
      digits: '•••• 4321',
      amount: 500,
      limit: 2000,
      usedPercentage: 25,
    });
    expect(manual.cards[1].digits).toBe('');
  });

  it('leaves the manual group empty when there are no manual cards', async () => {
    const { service } = buildService([]);

    expect((await service('user-1', pluggyCards)).manual).toEqual(emptyOverview);
  });

  it('leaves the bank group empty when the bank has no cards', async () => {
    const { service } = buildService(manualUsage);

    expect((await service('user-1', noPluggyCards)).connected).toEqual(emptyOverview);
  });

  it('returns two empty groups when there are no cards at all', async () => {
    const { service } = buildService([]);

    expect(await service('user-1', noPluggyCards)).toEqual({ connected: emptyOverview, manual: emptyOverview });
  });
});
