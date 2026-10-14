import { describe, it, expect } from 'vitest';
import { sanitizeTransactions } from '@/modules/pluggy-sync/domain/classification';
import { mixedBankTransactions } from '../../fixtures/mixed-bank-transactions';

describe('sanitizeTransactions', () => {
  it('eliminates double counting of credit card payments and internal transfers', () => {
    const { summary } = sanitizeTransactions(mixedBankTransactions);

    expect(summary.totalIncome).toBe(5000);
    expect(summary.totalExpenses).toBe(450);
    expect(summary.categoryTotals['Groceries']).toBe(300);
    expect(summary.categoryTotals['Eating out']).toBe(150);
  });
});
