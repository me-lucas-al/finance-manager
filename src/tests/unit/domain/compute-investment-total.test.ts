import { describe, expect, it } from 'vitest';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { computeInvestmentTotal } from '@/modules/finance/domain/services/compute-investment-total';

const contribution: LedgerEntry = {
  id: 'i1',
  kind: 'investment',
  date: '2026-03-10',
  description: 'Aporte',
  category: 'CDB',
  amount: 300,
  account: 'manual',
};

describe('computeInvestmentTotal', () => {
  it('sums manual contributions when there are no synced holdings', () => {
    expect(computeInvestmentTotal([contribution], { holdings: [], accounts: [], initialBalance: 0 })).toBe(300);
  });

  it('uses only synced holdings so bank contributions are not counted twice', () => {
    const holding = { id: 'h1', name: 'CDB', type: 'FIXED_INCOME', balance: 1000 };
    expect(computeInvestmentTotal([contribution], { holdings: [holding], accounts: [], initialBalance: 0 })).toBe(1000);
  });
});
