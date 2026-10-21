import { describe, it, expect } from 'vitest';
import { toLedgerEntry, toLedgerTotals } from '@/modules/finance/infrastructure/ledger-query-rows';

describe('ledger query rows', () => {
  it('builds totals and balance from kind rows', () => {
    const totals = toLedgerTotals([
      { kind: 'income', total: 1000.005 },
      { kind: 'expense', total: 250.1 },
    ]);

    expect(totals).toEqual({ income: 1000.01, expenses: 250.1, investments: 0, balance: 749.91 });
  });

  it('returns zeros when nothing matched', () => {
    expect(toLedgerTotals([])).toEqual({ income: 0, expenses: 0, investments: 0, balance: 0 });
  });

  it('marks rows that did not come from manual entry as imported', () => {
    const row = { id: 'a', kind: 'income' as const, date: '2026-10-01', description: 'Pix', category: 'Outros', amount: 5, source: 'pluggy' };

    expect(toLedgerEntry(row)).toMatchObject({ imported: true, account: 'Pluggy' });
    expect(toLedgerEntry({ ...row, source: 'manual' })).not.toHaveProperty('imported');
  });
});
