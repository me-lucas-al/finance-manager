import { describe, it, expect, vi } from 'vitest';
import { createCreditCardOverviewService } from '@/modules/finance/application/services/credit-card-overview-service';
import type { CreditCardUsage } from '@/modules/finance/domain/models/credit-card';
import type { DataMode } from '@/modules/users/domain/models/user';
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

function build(mode: DataMode | null) {
  const listUsage = vi.fn(async () => manualUsage);
  const service = createCreditCardOverviewService({ readDataMode: async () => mode, listUsage });
  return { service, listUsage };
}

describe('credit card overview by data mode', () => {
  it('shows only Pluggy cards in pluggy mode and never reads manual cards', async () => {
    const { service, listUsage } = build('pluggy');

    const overview = await service('user-1', pluggyCards);

    expect(overview).toEqual({ source: 'pluggy', total: 900, limit: 3000, usedPercentage: 30, cards: pluggyCards.cards });
    expect(listUsage).not.toHaveBeenCalled();
  });

  it('keeps the Pluggy view before the user picks a mode', async () => {
    const { service } = build(null);

    expect((await service('user-1', pluggyCards)).source).toBe('pluggy');
  });

  it('shows only manual cards in manual mode, ignoring Pluggy data', async () => {
    const { service, listUsage } = build('manual');

    const overview = await service('user-1', pluggyCards);

    expect(listUsage).toHaveBeenCalledWith('user-1');
    expect(overview).toMatchObject({ source: 'manual', total: 800, limit: 4000, usedPercentage: 20 });
    expect(overview.cards.map((card) => card.id)).toEqual(['m1', 'm2']);
  });

  it('describes each manual card with digits, limit and usage', async () => {
    const { service } = build('manual');

    const { cards } = await service('user-1', pluggyCards);

    expect(cards[0]).toEqual({
      id: 'm1',
      name: 'Nubank',
      digits: '•••• 4321',
      amount: 500,
      limit: 2000,
      usedPercentage: 25,
    });
    expect(cards[1].digits).toBe('');
  });

  it('returns an empty manual overview when there are no cards', async () => {
    const service = createCreditCardOverviewService({ readDataMode: async () => 'manual', listUsage: async () => [] });

    expect(await service('user-1', pluggyCards)).toEqual({
      source: 'manual',
      total: 0,
      limit: 0,
      usedPercentage: 0,
      cards: [],
    });
  });
});
