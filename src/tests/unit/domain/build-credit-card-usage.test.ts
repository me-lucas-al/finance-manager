import { describe, it, expect } from 'vitest';
import { buildCreditCardUsage } from '@/modules/finance/domain/services/build-credit-card-usage';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

const TODAY = '2026-10-15';

describe('buildCreditCardUsage', () => {
  it('sums only the card expenses inside the open invoice', () => {
    const card = makeCreditCard({ id: 'a', closingDay: 10, creditLimit: 1000 });
    const expenses = [
      { creditCardId: 'a', amount: 100, date: '2026-10-10' },
      { creditCardId: 'a', amount: 150, date: '2026-10-11' },
      { creditCardId: 'a', amount: 50, date: '2026-11-10' },
      { creditCardId: 'a', amount: 999, date: '2026-11-11' },
      { creditCardId: 'b', amount: 777, date: '2026-10-12' },
    ];

    const usage = buildCreditCardUsage(card, expenses, TODAY);

    expect(usage.used).toBe(200);
    expect(usage.percentage).toBe(20);
    expect(usage.cycle).toEqual({ start: '2026-10-11', end: '2026-11-10' });
  });

  it('falls back to the current month without a closing day', () => {
    const card = makeCreditCard({ id: 'a', closingDay: null, creditLimit: 400 });
    const expenses = [
      { creditCardId: 'a', amount: 100, date: '2026-09-30' },
      { creditCardId: 'a', amount: 100, date: '2026-10-01' },
    ];

    expect(buildCreditCardUsage(card, expenses, TODAY).used).toBe(100);
  });

  it('reports zero percent when the limit is zero', () => {
    const card = makeCreditCard({ id: 'a', creditLimit: 0, closingDay: null });
    const expenses = [{ creditCardId: 'a', amount: 80, date: '2026-10-02' }];

    expect(buildCreditCardUsage(card, expenses, TODAY).percentage).toBe(0);
  });

  it('does not cap the percentage above the limit', () => {
    const card = makeCreditCard({ id: 'a', creditLimit: 100, closingDay: null });
    const expenses = [{ creditCardId: 'a', amount: 150, date: '2026-10-02' }];

    expect(buildCreditCardUsage(card, expenses, TODAY).percentage).toBe(150);
  });
});
