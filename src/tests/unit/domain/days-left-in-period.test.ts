import { describe, it, expect } from 'vitest';
import { daysLeftInPeriod, toPeriodWindow } from '@/modules/periods/domain/period-window';

const window = toPeriodWindow({
  id: 'p1',
  startDate: new Date(2026, 9, 15),
  endDate: new Date(2026, 10, 14, 23, 59, 59, 999),
});

describe('daysLeftInPeriod', () => {
  it('counts the last day of the period as a remaining day', () => {
    expect(daysLeftInPeriod(window, new Date('2026-11-14T15:00:00Z'))).toBe(1);
  });

  it('counts the days until the period ends', () => {
    expect(daysLeftInPeriod(window, new Date('2026-10-20T15:00:00Z'))).toBe(26);
  });

  it('never goes below zero after the period ended', () => {
    expect(daysLeftInPeriod(window, new Date('2026-11-20T15:00:00Z'))).toBe(0);
  });
});
