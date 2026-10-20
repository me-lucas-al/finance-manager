import { describe, it, expect } from 'vitest';
import { toPeriodReference } from '@/modules/periods/domain/period-reference';

describe('toPeriodReference', () => {
  it('uses the month the period starts in as the reference month', () => {
    const period = { id: 'p1', startDate: new Date('2026-10-15T03:00:00.000Z') };

    expect(toPeriodReference(period)).toEqual({ periodId: 'p1', referenceMonth: '2026-10' });
  });

  it('keeps the start month when the period ends in the next month', () => {
    const period = { id: 'p2', startDate: new Date('2026-12-15T03:00:00.000Z') };

    expect(toPeriodReference(period).referenceMonth).toBe('2026-12');
  });
});
