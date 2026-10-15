import { describe, it, expect } from 'vitest';
import { buildAssetsData } from '@/modules/finance/domain/services/build-assets-data';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';

const entry = (overrides: Partial<LedgerEntry>): LedgerEntry => ({
  id: 'v1',
  kind: 'investment',
  date: '2026-03-03',
  description: 'Aporte mensal',
  category: 'CDB',
  amount: 800,
  account: 'Manual',
  fixed: false,
  ...overrides,
});

describe('buildAssetsData', () => {
  it('exposes the fields needed to edit an investment', () => {
    const { assets } = buildAssetsData([entry({})]);

    expect(assets[0]).toMatchObject({
      id: 'v1',
      name: 'Aporte mensal',
      type: 'CDB',
      amount: 800,
      date: '2026-03-03',
      percentage: 100,
    });
  });

  it('ignores incomes and expenses', () => {
    const { assets, total } = buildAssetsData([entry({}), entry({ id: 'e1', kind: 'expense' }), entry({ id: 'i1', kind: 'income' })]);

    expect(assets).toHaveLength(1);
    expect(total).toBe(800);
  });
});
