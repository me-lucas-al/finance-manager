import { describe, it, expect } from 'vitest';
import { nextDay, resolveDueDate } from '@/modules/finance/domain/services/resolve-due-date';

describe('resolveDueDate', () => {
  it('keeps the due day when the month is long enough', () => {
    expect(resolveDueDate('2026-03', 31)).toBe('2026-03-31');
    expect(resolveDueDate('2026-03', 5)).toBe('2026-03-05');
  });

  it('falls to the last day of a 30-day month', () => {
    expect(resolveDueDate('2026-04', 31)).toBe('2026-04-30');
  });

  it('falls to the last day of February in common and leap years', () => {
    expect(resolveDueDate('2026-02', 31)).toBe('2026-02-28');
    expect(resolveDueDate('2026-02', 29)).toBe('2026-02-28');
    expect(resolveDueDate('2028-02', 29)).toBe('2028-02-29');
    expect(resolveDueDate('2028-02', 30)).toBe('2028-02-29');
  });

  it('handles the year boundary', () => {
    expect(resolveDueDate('2026-12', 31)).toBe('2026-12-31');
    expect(resolveDueDate('2027-01', 31)).toBe('2027-01-31');
  });
});

describe('nextDay', () => {
  it('moves across months and years', () => {
    expect(nextDay('2026-02-28')).toBe('2026-03-01');
    expect(nextDay('2026-12-31')).toBe('2027-01-01');
    expect(nextDay('2028-02-28')).toBe('2028-02-29');
  });
});
