import { describe, it, expect } from 'vitest';
import { toLocalDateString, toMonthKey, dateAtNoon, shiftMonth } from '@/lib/month';

describe('month helpers', () => {
  it('uses the Sao Paulo calendar day, not the UTC day', () => {
    const lateEveningBrt = new Date('2026-03-01T02:00:00Z');
    expect(toLocalDateString(lateEveningBrt)).toBe('2026-02-28');
    expect(toMonthKey(lateEveningBrt)).toBe('2026-02');
  });

  it('keeps the same month when UTC and Sao Paulo agree', () => {
    expect(toMonthKey(new Date('2026-03-15T15:00:00Z'))).toBe('2026-03');
  });

  it('builds a date at noon that stays on the same day in every timezone', () => {
    const noon = dateAtNoon('2026-03-05');
    expect(noon.toISOString()).toBe('2026-03-05T15:00:00.000Z');
    expect(toLocalDateString(noon)).toBe('2026-03-05');
  });

  it('shifts months across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });
});
