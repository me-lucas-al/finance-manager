import { describe, it, expect } from 'vitest';
import { getExpensesByCategory, getEvolutionData, getInvestmentsByType, getExpensesByDay } from './analyticsUtils';
import { Expense } from '@/modules/expenses/domain/repositories/IExpenseRepository';
import { Income } from '@/modules/incomes/domain/repositories/IIncomeRepository';
import { Investment } from '@/modules/investments/domain/repositories/IInvestmentRepository';
import { FinancialPeriod } from '@/modules/periods/domain/repositories/IPeriodRepository';

describe('Analytics Utilities', () => {
  it('should calculate expenses by category', () => {
    const expenses: Partial<Expense>[] = [
      { category: 'Food', amount: 15000 },
      { category: 'Food', amount: 5000 },
      { category: 'Transport', amount: 8000 }
    ];

    const result = getExpensesByCategory(expenses as Expense[]);
    expect(result).toEqual([
      { category: 'Food', amount: 200 },
      { category: 'Transport', amount: 80 }
    ]);
  });

  it('should calculate evolution data across periods', () => {
    const periods: Partial<FinancialPeriod>[] = [
      { id: 'p1', startDate: new Date('2026-01-01') },
      { id: 'p2', startDate: new Date('2026-02-01') }
    ];
    
    const expenses: Partial<Expense>[] = [
      { periodId: 'p1', amount: 10000 },
      { periodId: 'p2', amount: 20000 }
    ];
    
    const incomes: Partial<Income>[] = [
      { periodId: 'p1', amount: 50000 },
      { periodId: 'p2', amount: 60000 }
    ];

    const investments: Partial<Investment>[] = [
      { periodId: 'p1', amount: 10000 },
      { periodId: 'p2', amount: 10000 }
    ];

    const result = getEvolutionData(periods as FinancialPeriod[], expenses as Expense[], incomes as Income[], investments as Investment[]);
    
    expect(result[0].expenses).toBe(100);
    expect(result[0].incomes).toBe(500);
    expect(result[0].investments).toBe(100);
    expect(result[0].balance).toBe(300); // 500 - 100 - 100
  });

  it('should calculate investments by type', () => {
    const investments: Partial<Investment>[] = [
      { type: 'Stocks', amount: 100000 },
      { type: 'Bonds', amount: 50000 }
    ];

    const result = getInvestmentsByType(investments as Investment[]);
    expect(result).toEqual([
      { type: 'Stocks', amount: 1000 },
      { type: 'Bonds', amount: 500 }
    ]);
  });

  it('should calculate expenses by day', () => {
    const expenses: Partial<Expense>[] = [
      { date: new Date('2026-08-01T12:00:00'), amount: 5000 },
      { date: new Date('2026-08-01T15:00:00'), amount: 15000 },
      { date: new Date('2026-08-02T10:00:00'), amount: 10000 }
    ];

    const result = getExpensesByDay(expenses as Expense[]);
    expect(result).toEqual([
      { date: '01/08', amount: 200 },
      { date: '02/08', amount: 100 }
    ]);
  });
});
