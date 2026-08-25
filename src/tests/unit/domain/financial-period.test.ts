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

  it('should include the entire last day of the period (23:59:59.999)', () => {
    const date = new Date(2026, 9, 15);
    const period = getFinancialPeriod(date);
    expect(period.end.getHours()).toBe(23);
    expect(period.end.getMinutes()).toBe(59);
    expect(period.end.getSeconds()).toBe(59);
  });

  it('should not overflow into the next month when endDay >= startDay (full month cycle)', () => {
    const date = new Date(2026, 9, 20); // Oct 20, 2026
    const period = getFinancialPeriod(date, 1, 30);
    expect(period.start.getMonth()).toBe(9); // Oct
    expect(period.start.getDate()).toBe(1);
    expect(period.end.getMonth()).toBe(9); // still Oct, not Nov
    expect(period.end.getDate()).toBe(30);
  });

  it('should clamp endDay to the last day of a short month (Feb 30 -> Feb 28)', () => {
    const date = new Date(2026, 1, 15); // Feb 15, 2026 (not a leap year)
    const period = getFinancialPeriod(date, 1, 30);
    expect(period.end.getMonth()).toBe(1); // still Feb, not March
    expect(period.end.getDate()).toBe(28);
  });

  it('should clamp endDay to the last day of a leap-year February', () => {
    const date = new Date(2028, 1, 15); // Feb 15, 2028 (leap year)
    const period = getFinancialPeriod(date, 1, 30);
    expect(period.end.getMonth()).toBe(1); // Feb
    expect(period.end.getDate()).toBe(29);
  });

  it('should handle startDay=31 in months with fewer than 31 days', () => {
    const date = new Date(2026, 2, 5); // Mar 5, 2026 -> belongs to Feb 31(clamped) -> Mar 30 cycle
    const period = getFinancialPeriod(date, 31, 30);
    expect(period.start.getMonth()).toBe(1); // Feb (28 days, clamped from 31)
    expect(period.start.getDate()).toBe(28);
    expect(period.end.getMonth()).toBe(2); // March
    expect(period.end.getDate()).toBe(30);
  });
});
