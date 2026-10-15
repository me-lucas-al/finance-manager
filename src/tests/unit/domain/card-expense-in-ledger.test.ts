import { describe, it, expect } from 'vitest';
import { expenseToEntry } from '@/modules/finance/domain/services/ledger-mapper';
import { buildOverviewData } from '@/modules/finance/domain/services/build-overview-data';
import { totalsOf } from '@/modules/finance/domain/services/summarize-ledger';
import { transaction } from '@/tests/fakes/fake-ledger-source';

describe('credit card expenses in the ledger', () => {
  const cardExpense = { ...transaction('card-1', '2026-03-05', 300, 'Mercado'), creditCardId: 'card-a' };
  const cashExpense = transaction('cash-1', '2026-03-06', 100, 'Mercado');

  it('counts a card expense as a regular expense of its month', () => {
    const entries = [cardExpense, cashExpense].map(expenseToEntry);

    expect(totalsOf(entries).expenses).toBe(400);
  });

  it('lowers the balance exactly like any other expense', () => {
    const withCard = buildOverviewData([expenseToEntry(cardExpense)], '2026-03');
    const withoutCard = buildOverviewData([expenseToEntry(transaction('x', '2026-03-05', 300, 'Mercado'))], '2026-03');

    expect(withCard.bankTotal).toBe(-300);
    expect(withCard.bankTotal).toBe(withoutCard.bankTotal);
  });

  it('keeps the card link on the ledger entry', () => {
    expect(expenseToEntry(cardExpense).creditCardId).toBe('card-a');
    expect(expenseToEntry(cashExpense).creditCardId).toBeUndefined();
  });
});
