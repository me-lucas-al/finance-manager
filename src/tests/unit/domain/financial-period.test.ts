import { describe, it, expect } from 'vitest';
import { getFinancialPeriod } from '../../../modules/periods/domain/financial-period';

describe('Financial Period', () => {
  it('should correctly calculate period for a date >= startDay (e.g., 15th)', () => {
    const date = new Date(2026, 9, 15); // Oct 15, 2026
    const period = getFinancialPeriod(date);
    expect(period.start.getFullYear()).toBe(2026);
    expect(period.start.getMonth()).toBe(9); // Oct
    expect(period.start.getDate()).toBe(15);
    
    expect(period.end.getFullYear()).toBe(2026);
    expect(period.end.getMonth()).toBe(10); // Nov
    expect(period.end.getDate()).toBe(14);
  });

  it('should correctly calculate period for a date <= endDay (e.g., 14th)', () => {
    const date = new Date(2026, 10, 14); // Nov 14, 2026
    const period = getFinancialPeriod(date);
    expect(period.start.getFullYear()).toBe(2026);
    expect(period.start.getMonth()).toBe(9); // Oct
    expect(period.start.getDate()).toBe(15);
    
    expect(period.end.getFullYear()).toBe(2026);
    expect(period.end.getMonth()).toBe(10); // Nov
    expect(period.end.getDate()).toBe(14);
  });

  it('should handle year change correctly (December to January)', () => {
    const date = new Date(2026, 11, 20); // Dec 20, 2026
    const period = getFinancialPeriod(date);
    expect(period.start.getFullYear()).toBe(2026);
    expect(period.start.getMonth()).toBe(11); // Dec
    
    expect(period.end.getFullYear()).toBe(2027);
    expect(period.end.getMonth()).toBe(0); // Jan
  });

  it('should handle year change correctly (January to December)', () => {
    const date = new Date(2027, 0, 5); // Jan 5, 2027
    const period = getFinancialPeriod(date);
    expect(period.start.getFullYear()).toBe(2026);
    expect(period.start.getMonth()).toBe(11); // Dec
    
    expect(period.end.getFullYear()).toBe(2027);
    expect(period.end.getMonth()).toBe(0); // Jan
  });
});
