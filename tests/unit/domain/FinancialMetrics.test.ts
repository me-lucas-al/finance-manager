import { describe, it, expect } from 'vitest';
import { FinancialPeriod } from '../../../src/modules/finance/domain/FinancialPeriod';
import { Income } from '../../../src/modules/finance/domain/Income';
import { Expense } from '../../../src/modules/finance/domain/Expense';
import { Investment } from '../../../src/modules/finance/domain/Investment';
import { UserConfig } from '../../../src/modules/finance/domain/UserConfig';
import { DistributionRule } from '../../../src/modules/finance/domain/DistributionRule';
import { FinancialMetrics, FinancialStatus } from '../../../src/modules/finance/domain/FinancialMetrics';

describe('FinancialMetrics', () => {
  const period = new FinancialPeriod(15, 14, 2026, 8);
  const dateInPeriod = new Date('2026-08-20T12:00:00Z');

  it('should calculate metrics correctly for zero income', () => {
    const metrics = new FinancialMetrics(period, [], [], []);
    expect(metrics.totalIncome).toBe(0);
    expect(metrics.totalExpense).toBe(0);
    expect(metrics.totalInvestment).toBe(0);
    expect(metrics.balance).toBe(0);
    expect(metrics.status).toBe(FinancialStatus.ON_TRACK);
  });

  it('should result in OFF_TRACK for zero income and positive expenses (negative balance)', () => {
    const expenses = [new Expense('e1', 'Food', 100, dateInPeriod)];
    const metrics = new FinancialMetrics(period, [], expenses, []);
    expect(metrics.balance).toBe(-100);
    expect(metrics.status).toBe(FinancialStatus.OFF_TRACK);
  });

  it('should calculate multiple incomes, expenses, and investments', () => {
    const incomes = [
      new Income('i1', 'Salary', 1000, dateInPeriod),
      new Income('i2', 'Freelance', 500, dateInPeriod)
    ];
    const expenses = [
      new Expense('e1', 'Rent', 800, dateInPeriod),
      new Expense('e2', 'Food', 200, dateInPeriod)
    ];
    const investments = [
      new Investment('v1', 'Stocks', 300, dateInPeriod)
    ];
    const metrics = new FinancialMetrics(period, incomes, expenses, investments);
    
    expect(metrics.totalIncome).toBe(1500);
    expect(metrics.totalExpense).toBe(1000);
    expect(metrics.totalInvestment).toBe(300);
    expect(metrics.balance).toBe(200);
    // Expenses: 1000 / 1500 = 66.6% (< 80%)
    // Investments: 300 / 1500 = 20% (>= 20%)
    expect(metrics.status).toBe(FinancialStatus.ON_TRACK);
  });

  it('should return OFF_TRACK for negative balance', () => {
    const incomes = [new Income('i1', 'Salary', 1000, dateInPeriod)];
    const expenses = [new Expense('e1', 'Rent', 1200, dateInPeriod)];
    const metrics = new FinancialMetrics(period, incomes, expenses, []);
    expect(metrics.balance).toBe(-200);
    expect(metrics.status).toBe(FinancialStatus.OFF_TRACK);
  });

  it('should return WARNING for expenses above configured percentage', () => {
    const incomes = [new Income('i1', 'Salary', 1000, dateInPeriod)];
    const expenses = [new Expense('e1', 'Rent', 850, dateInPeriod)]; // 85%
    const investments = [new Investment('v1', 'Stocks', 100, dateInPeriod)]; // 10%

    // Using default config (80/20)
    const metrics = new FinancialMetrics(period, incomes, expenses, investments);
    expect(metrics.expensePercentage).toBe(85);
    expect(metrics.status).toBe(FinancialStatus.WARNING);
  });

  it('should return WARNING for investment below configured percentage', () => {
    const incomes = [new Income('i1', 'Salary', 1000, dateInPeriod)];
    const expenses = [new Expense('e1', 'Rent', 500, dateInPeriod)]; // 50%
    const investments = [new Investment('v1', 'Stocks', 100, dateInPeriod)]; // 10% (below 20)

    const metrics = new FinancialMetrics(period, incomes, expenses, investments);
    expect(metrics.investmentPercentage).toBe(10);
    expect(metrics.status).toBe(FinancialStatus.WARNING);
  });

  it('should return ON_TRACK for investment above configured percentage', () => {
    const incomes = [new Income('i1', 'Salary', 1000, dateInPeriod)];
    const expenses = [new Expense('e1', 'Rent', 500, dateInPeriod)]; // 50%
    const investments = [new Investment('v1', 'Stocks', 300, dateInPeriod)]; // 30% (above 20)

    const metrics = new FinancialMetrics(period, incomes, expenses, investments);
    expect(metrics.investmentPercentage).toBe(30);
    expect(metrics.status).toBe(FinancialStatus.ON_TRACK);
  });

  it('should respect custom percentage configurations', () => {
    const incomes = [new Income('i1', 'Salary', 1000, dateInPeriod)];
    const expenses = [new Expense('e1', 'Rent', 850, dateInPeriod)]; // 85%
    const investments = [new Investment('v1', 'Stocks', 100, dateInPeriod)]; // 10%

    // Custom config: max expense 90%, min investment 5%
    const customConfig = new UserConfig(new DistributionRule(90, 5));
    const metrics = new FinancialMetrics(period, incomes, expenses, investments, customConfig);
    
    expect(metrics.status).toBe(FinancialStatus.ON_TRACK);
  });

  it('should filter out items outside the period', () => {
    const outsideDate = new Date('2026-08-10T12:00:00Z');
    const incomes = [
      new Income('i1', 'In', 1000, dateInPeriod),
      new Income('i2', 'Out', 500, outsideDate)
    ];
    const metrics = new FinancialMetrics(period, incomes, [], []);
    expect(metrics.totalIncome).toBe(1000);
  });

  it('should set investmentPercentage to Infinity if zero income and positive investment', () => {
    const investments = [new Investment('v1', 'Stocks', 100, dateInPeriod)];
    const metrics = new FinancialMetrics(period, [], [], investments);
    expect(metrics.totalIncome).toBe(0);
    expect(metrics.investmentPercentage).toBe(Infinity);
    expect(metrics.status).toBe(FinancialStatus.OFF_TRACK);
  });
});
