import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';
import { CARD_USER, createCreditCardHarness } from './credit-card-harness';

describe('ListCreditCardUsageUseCase', () => {
  let harness: ReturnType<typeof createCreditCardHarness>;

  beforeEach(() => {
    harness = createCreditCardHarness();
  });

  it('returns nothing and skips the spending query without cards', async () => {
    expect(await harness.usage.execute(CARD_USER)).toEqual([]);
    expect(harness.spending.listCardExpenses).not.toHaveBeenCalled();
  });

  it('lists only the caller cards with usage on the open invoice', async () => {
    harness.cards.items.push(
      makeCreditCard({ id: 'a', creditLimit: 1000, closingDay: 10 }),
      makeCreditCard({ id: 'b', userId: 'other' })
    );
    harness.expenses.push(
      { creditCardId: 'a', amount: 250, date: '2026-10-20' },
      { creditCardId: 'a', amount: 400, date: '2026-10-05' }
    );

    const usage = await harness.usage.execute(CARD_USER);

    expect(usage).toHaveLength(1);
    expect(usage[0]).toMatchObject({ used: 250, percentage: 25 });
  });

  it('queries one range spanning every card cycle', async () => {
    harness.cards.items.push(
      makeCreditCard({ id: 'a', closingDay: 10 }),
      makeCreditCard({ id: 'b', closingDay: null })
    );

    await harness.usage.execute(CARD_USER);

    expect(harness.spending.listCardExpenses).toHaveBeenCalledWith(CARD_USER, { from: '2026-10-01', to: '2026-11-10' });
  });
});
