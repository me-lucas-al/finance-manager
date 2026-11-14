import { describe, it, expect } from 'vitest';
import { expenseToEntry } from '@/modules/finance/domain/services/ledger-mapper';
import { monthRange } from '@/modules/finance/domain/models/date-range';
import { buildMovementsData } from '@/modules/finance/domain/services/build-movements-data';
import { DEFAULT_STATEMENT_FILTERS } from '@/modules/finance/domain/models/statement-filters';
import { transaction } from '@/tests/fakes/fake-ledger-source';

const cardExpense = expenseToEntry({ ...transaction('c1', '2026-03-05', 120, 'Mercado'), creditCardId: 'card-a' });
const cashExpense = expenseToEntry(transaction('c2', '2026-03-06', 30, 'Mercado'));

describe('movements with credit card links', () => {
  it('names the card on linked expenses', () => {
    const data = buildMovementsData([cardExpense, cashExpense], monthRange('2026-03'), DEFAULT_STATEMENT_FILTERS, { 'card-a': 'Nubank' });

    const linked = data.transactions.find((item) => item.id === 'c1');
    expect(linked).toMatchObject({ creditCardId: 'card-a', creditCardName: 'Nubank' });
  });

  it('leaves unlinked expenses without card fields', () => {
    const data = buildMovementsData([cardExpense, cashExpense], monthRange('2026-03'), DEFAULT_STATEMENT_FILTERS, { 'card-a': 'Nubank' });

    const unlinked = data.transactions.find((item) => item.id === 'c2');
    expect(unlinked?.creditCardId).toBeUndefined();
    expect(unlinked?.creditCardName).toBeUndefined();
  });

  it('keeps the link id even when the card name is unknown', () => {
    const data = buildMovementsData([cardExpense], monthRange('2026-03'));

    expect(data.transactions[0].creditCardId).toBe('card-a');
    expect(data.transactions[0].creditCardName).toBeUndefined();
  });

  it('totals card expenses with all others', () => {
    const data = buildMovementsData([cardExpense, cashExpense], monthRange('2026-03'));

    expect(data.totalExpenses).toBe(150);
  });
});

describe('movements of a financial period', () => {
  it('counts only the entries between the first and the last day of the range', () => {
    const before = expenseToEntry(transaction('p1', '2026-02-14', 10, 'Mercado'));
    const first = expenseToEntry(transaction('p2', '2026-02-15', 20, 'Mercado'));
    const last = expenseToEntry(transaction('p3', '2026-03-14', 30, 'Mercado'));
    const after = expenseToEntry(transaction('p4', '2026-03-15', 40, 'Mercado'));

    const data = buildMovementsData([before, first, last, after], { from: '2026-02-15', to: '2026-03-14' });

    expect(data.transactions.map((item) => item.id).sort()).toEqual(['p2', 'p3']);
    expect(data.totalExpenses).toBe(50);
  });

  it('includes reason and pending status in movements', () => {
    const pendingTx = expenseToEntry({
      ...transaction('p5', '2026-03-01', 80, 'Mercado'),
      reason: 'Compras do mês',
      status: 'pending_reason',
    });
    const data = buildMovementsData([pendingTx], monthRange('2026-03'));

    expect(data.totalPending).toBe(80);
    expect(data.pendingExpenses[0]).toMatchObject({ name: 'Mercado', amount: 80 });
    expect(data.transactions[0]).toMatchObject({ reason: 'Compras do mês', status: 'pending_reason' });
  });
});
