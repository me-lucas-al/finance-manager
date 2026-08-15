import { describe, it, expect } from 'vitest';
import { calculateMetrics } from '../../../modules/finance/domain/financial-metrics';

describe('Financial Metrics', () => {
  it('should calculate metrics correctly for zero income', () => {
    const metrics = calculateMetrics([], [], []);
    expect(metrics.totalIncome).toBe(0);
    expect(metrics.totalExpenses).toBe(0);
    expect(metrics.totalInvestments).toBe(0);
    expect(metrics.balance).toBe(0);
    expect(metrics.expensePercentage).toBe(0);
    expect(metrics.investmentPercentage).toBe(0);
    expect(metrics.status).toBe('ON_TRACK');
  });

  it('should be OFF_TRACK when expenses exceed zero income', () => {
    const metrics = calculateMetrics([], [100], []);
    expect(metrics.status).toBe('OFF_TRACK');
  });

  it('should calculate multiple incomes, expenses, investments', () => {
    const metrics = calculateMetrics([1000, 500], [200, 300], [200, 200]);
    expect(metrics.totalIncome).toBe(1500);
    expect(metrics.totalExpenses).toBe(500);
    expect(metrics.totalInvestments).toBe(400);
    expect(metrics.balance).toBe(600);
    expect(metrics.expensePercentage).toBeCloseTo(33.33);
    expect(metrics.investmentPercentage).toBeCloseTo(26.67);
    expect(metrics.status).toBe('ON_TRACK');
  });

  it('should be OFF_TRACK if expenses > configured %', () => {
    const metrics = calculateMetrics([1000], [850], [200], 80, 20);
    expect(metrics.status).toBe('OFF_TRACK');
  });

  it('should be OFF_TRACK if investments < configured %', () => {
    const metrics = calculateMetrics([1000], [500], [100], 80, 20);
    expect(metrics.status).toBe('OFF_TRACK');
  });

  it('should be WARNING if close to limits', () => {
    const metrics = calculateMetrics([1000], [780], [220], 80, 20);
    expect(metrics.status).toBe('WARNING');
  });

  it('should be WARNING if investment is close to limit', () => {
    const metrics = calculateMetrics([1000], [500], [220], 80, 20);
    expect(metrics.status).toBe('WARNING');
  });

  it('should allow custom configuration percentages', () => {
    const metrics = calculateMetrics([1000], [600], [150], 60, 15);
    expect(metrics.expensePercentage).toBe(60);
    expect(metrics.investmentPercentage).toBe(15);
    expect(metrics.status).toBe('WARNING');
  });
});
