import { describe, it, expect } from 'vitest';
import { resolveBillingCycle } from '@/modules/finance/domain/services/resolve-billing-cycle';

describe('resolveBillingCycle', () => {
  it('uses the calendar month when there is no closing day', () => {
    expect(resolveBillingCycle(null, '2026-10-15')).toEqual({ start: '2026-10-01', end: '2026-10-31' });
  });

  it('keeps the invoice open until the closing day inclusive', () => {
    expect(resolveBillingCycle(10, '2026-10-10')).toEqual({ start: '2026-09-11', end: '2026-10-10' });
    expect(resolveBillingCycle(10, '2026-10-05')).toEqual({ start: '2026-09-11', end: '2026-10-10' });
  });

  it('starts the next invoice the day after closing', () => {
    expect(resolveBillingCycle(10, '2026-10-11')).toEqual({ start: '2026-10-11', end: '2026-11-10' });
  });

  it('rolls over the year boundary', () => {
    expect(resolveBillingCycle(10, '2026-12-20')).toEqual({ start: '2026-12-11', end: '2027-01-10' });
    expect(resolveBillingCycle(10, '2026-01-05')).toEqual({ start: '2025-12-11', end: '2026-01-10' });
  });

  it('clamps the closing day to the length of short months', () => {
    expect(resolveBillingCycle(31, '2026-02-20')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
    expect(resolveBillingCycle(31, '2026-03-05')).toEqual({ start: '2026-03-01', end: '2026-03-31' });
  });
});
