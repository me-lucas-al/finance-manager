import { describe, it, expect } from 'vitest';
import { calculateReportMetrics } from './reports';

describe('calculateReportMetrics', () => {
  it('should calculate metrics correctly for empty arrays', () => {
    const metrics = calculateReportMetrics([], [], []);
    expect(metrics).toEqual({
      totalIncomes: 0,
      totalExpenses: 0,
      totalInvestments: 0,
      balance: 0,
      averageExpense: 0,
      maxExpense: 0,
      dominantCategory: null,
      expensePercentage: 0,
      investmentPercentage: 0,
    });
  });

  it('should calculate metrics correctly with data', () => {
    const incomes = [{ amount: 500000 }]; // 5000.00
    const expenses = [
      { amount: 100000, category: 'Food' },
      { amount: 200000, category: 'Rent' },
      { amount: 50000, category: 'Food' },
    ];
    const investments = [{ amount: 50000 }];

    const metrics = calculateReportMetrics(incomes, expenses, investments);

    expect(metrics.totalIncomes).toBe(500000);
    expect(metrics.totalExpenses).toBe(350000);
    expect(metrics.totalInvestments).toBe(50000);
    expect(metrics.balance).toBe(100000); // 500000 - 350000 - 50000
    expect(metrics.averageExpense).toBe(350000 / 3);
    expect(metrics.maxExpense).toBe(200000);
    expect(metrics.dominantCategory).toBe('Rent');
    expect(metrics.expensePercentage).toBe((350000 / 500000) * 100);
    expect(metrics.investmentPercentage).toBe((50000 / 500000) * 100);
  });
});
