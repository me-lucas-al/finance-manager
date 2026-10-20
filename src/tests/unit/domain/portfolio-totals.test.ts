import { describe, it, expect } from 'vitest';
import { bankBalanceFromTotals, investedTotalFromTotals } from '@/modules/finance/domain/services/portfolio-totals';
import { calculateSnapshotFromTotals } from '@/modules/finance/domain/services/calculate-snapshot-from-totals';
import { EMPTY_TOTALS } from '@/modules/finance/domain/services/summarize-ledger';
import type { Portfolio } from '@/modules/finance/domain/models/portfolio';

const allTime = { income: 5000, expenses: 1000, investments: 500, balance: 3500 };
const account = (accountType: string, balance: number) => ({ id: accountType, bank: 'b', accountType, balance, creditLimit: null });

describe('portfolio totals', () => {
  it('uses the initial balance plus the ledger balance without bank accounts', () => {
    const portfolio: Portfolio = { holdings: [], accounts: [], initialBalance: 200 };

    expect(bankBalanceFromTotals(allTime, portfolio)).toBe(3700);
  });

  it('prefers the sum of bank accounts and ignores credit cards', () => {
    const portfolio: Portfolio = {
      holdings: [],
      accounts: [account('CHECKING_ACCOUNT', 100.5), account('CREDIT_CARD', 900)],
      initialBalance: 200,
    };

    expect(bankBalanceFromTotals(allTime, portfolio)).toBe(100.5);
  });

  it('counts contributions only when there are no synced holdings', () => {
    const withoutHoldings: Portfolio = { holdings: [], accounts: [], initialBalance: 0 };
    const withHoldings: Portfolio = {
      holdings: [{ id: 'h', name: 'CDB', type: 'FIXED_INCOME', balance: 2000 }],
      accounts: [],
      initialBalance: 0,
    };

    expect(investedTotalFromTotals(allTime, withoutHoldings)).toBe(500);
    expect(investedTotalFromTotals(allTime, withHoldings)).toBe(2000);
  });
});

describe('calculateSnapshotFromTotals', () => {
  it('compares categories with the previous period and attaches goals', () => {
    const aggregates = {
      current: { income: 1000, expenses: 300, investments: 0, balance: 700 },
      previous: { income: 1000, expenses: 200, investments: 0, balance: 800 },
      twoAgo: EMPTY_TOTALS,
      currentCategories: [{ category: 'Mercado', total: 300 }],
      previousCategories: [{ category: 'Mercado', total: 200 }],
      allTime,
    };
    const goals = [{ category: 'mercado', targetAmount: '250' }] as never;

    const snapshot = calculateSnapshotFromTotals({ aggregates, goals });

    expect(snapshot.currentMonth.savingsRate).toBe(70);
    expect(snapshot.categoryMetrics).toEqual([
      { category: 'Mercado', currentAmount: 300, previousAmount: 200, diffPercentage: 50, goalAmount: 250 },
    ]);
  });
});
