import { describe, it, expect } from 'vitest';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import {
  totalsOf,
  entriesInMonth,
  monthlyEvolution,
  totalsByCategory,
  balanceThrough,
} from '@/modules/finance/domain/services/summarize-ledger';

const entry = (id: string, kind: LedgerEntry['kind'], date: string, amount: number, category = 'Outros'): LedgerEntry => ({
  id,
  kind,
  date,
  description: id,
  category,
  amount,
  account: 'Manual',
});

const ledger: LedgerEntry[] = [
  entry('i1', 'income', '2026-01-05', 5000, 'Salário'),
  entry('e1', 'expense', '2026-01-10', 1200.1, 'Mercado'),
  entry('v1', 'investment', '2026-01-15', 800, 'CDB'),
  entry('i2', 'income', '2026-02-05', 5000, 'Salário'),
  entry('e2', 'expense', '2026-02-12', 300.2, 'Mercado'),
  entry('e3', 'expense', '2026-02-20', 100, 'Lazer'),
];

describe('totalsOf', () => {
  it('subtracts expenses and investments from income', () => {
    expect(totalsOf(ledger)).toEqual({ income: 10000, expenses: 1600.3, investments: 800, balance: 7599.7 });
  });

  it('allows a negative balance', () => {
    expect(totalsOf([entry('e', 'expense', '2026-01-01', 10)]).balance).toBe(-10);
  });

  it('returns zeros for an empty ledger', () => {
    expect(totalsOf([])).toEqual({ income: 0, expenses: 0, investments: 0, balance: 0 });
  });
});

describe('month slicing', () => {
  it('keeps only entries of the month', () => {
    expect(entriesInMonth(ledger, '2026-02').map((e) => e.id)).toEqual(['i2', 'e2', 'e3']);
  });

  it('computes cumulative balance through a month', () => {
    expect(balanceThrough(ledger, '2026-01')).toBe(2999.9);
    expect(balanceThrough(ledger, '2026-02')).toBe(7599.7);
  });
});

describe('monthlyEvolution', () => {
  it('returns one point per month ending at the last month with cumulative balance', () => {
    const evolution = monthlyEvolution(ledger, '2026-02', 3);

    expect(evolution.map((p) => p.month)).toEqual(['2025-12', '2026-01', '2026-02']);
    expect(evolution[0]).toMatchObject({ income: 0, cumulativeBalance: 0 });
    expect(evolution[2]).toMatchObject({ income: 5000, expenses: 400.2, cumulativeBalance: 7599.7 });
  });
});

describe('totalsByCategory', () => {
  it('groups one kind by category, largest first', () => {
    expect(totalsByCategory(ledger, 'expense')).toEqual([
      { category: 'Mercado', total: 1500.3 },
      { category: 'Lazer', total: 100 },
    ]);
  });
});
