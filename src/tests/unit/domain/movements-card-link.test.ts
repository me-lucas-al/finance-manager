import { describe, it, expect } from 'vitest';
import { expenseToEntry } from '@/modules/finance/domain/services/ledger-mapper';
import { buildMovementsData } from '@/modules/finance/domain/services/build-movements-data';
import { DEFAULT_STATEMENT_FILTERS } from '@/modules/finance/domain/models/statement-filters';
import { transaction } from '@/tests/fakes/fake-ledger-source';

const cardExpense = expenseToEntry({ ...transaction('c1', '2026-03-05', 120, 'Mercado'), creditCardId: 'card-a' });
const cashExpense = expenseToEntry(transaction('c2', '2026-03-06', 30, 'Mercado'));

describe('movements with credit card links', () => {
  it('names the card on linked expenses', () => {
    const data = buildMovementsData([cardExpense, cashExpense], '2026-03', DEFAULT_STATEMENT_FILTERS, { 'card-a': 'Nubank' });

    const linked = data.transactions.find((item) => item.id === 'c1');
    expect(linked).toMatchObject({ creditCardId: 'card-a', creditCardName: 'Nubank' });
  });

  it('leaves unlinked expenses without card fields', () => {
    const data = buildMovementsData([cardExpense, cashExpense], '2026-03', DEFAULT_STATEMENT_FILTERS, { 'card-a': 'Nubank' });

    const unlinked = data.transactions.find((item) => item.id === 'c2');
    expect(unlinked?.creditCardId).toBeUndefined();
    expect(unlinked?.creditCardName).toBeUndefined();
  });

  it('keeps the link id even when the card name is unknown', () => {
    const data = buildMovementsData([cardExpense], '2026-03');

    expect(data.transactions[0].creditCardId).toBe('card-a');
    expect(data.transactions[0].creditCardName).toBeUndefined();
  });

  it('totals card expenses with all others', () => {
    const data = buildMovementsData([cardExpense, cashExpense], '2026-03');

    expect(data.totalExpenses).toBe(150);
  });
});
