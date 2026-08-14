import { describe, it, expect } from 'vitest';
import { FinancialPeriod } from '../../../src/modules/finance/domain/FinancialPeriod';

describe('FinancialPeriod', () => {
  it('should create a period from the 15th of the current month to the 14th of the next month', () => {
    const period = new FinancialPeriod(15, 14, 2026, 8); // startDay, endDay, year, month (1-12)
    
    expect(period.startDate.toISOString().split('T')[0]).toBe('2026-08-15');
    expect(period.endDate.toISOString().split('T')[0]).toBe('2026-09-14');
  });

  it('should handle year change correctly (December to January)', () => {
    const period = new FinancialPeriod(15, 14, 2026, 12);
    
    expect(period.startDate.toISOString().split('T')[0]).toBe('2026-12-15');
    expect(period.endDate.toISOString().split('T')[0]).toBe('2027-01-14');
  });

  it('should determine if a given date is within the period', () => {
    const period = new FinancialPeriod(15, 14, 2026, 8);
    
    const insideDate1 = new Date('2026-08-15T12:00:00Z');
    const insideDate2 = new Date('2026-09-10T12:00:00Z');
    const insideDate3 = new Date('2026-09-14T23:59:59Z');
    const outsideDate1 = new Date('2026-08-14T23:59:59Z');
    const outsideDate2 = new Date('2026-09-15T00:00:00Z');

    expect(period.contains(insideDate1)).toBe(true);
    expect(period.contains(insideDate2)).toBe(true);
    expect(period.contains(insideDate3)).toBe(true);
    expect(period.contains(outsideDate1)).toBe(false);
    expect(period.contains(outsideDate2)).toBe(false);
  });
});
