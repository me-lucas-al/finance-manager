import { describe, it, expect } from 'vitest';
import { resolveReportPeriod } from '@/app/(dashboard)/reports/resolve-report-period';

describe('resolveReportPeriod', () => {
  it('keeps all-time and valid months', () => {
    expect(resolveReportPeriod('all', '2026-03')).toBe('all');
    expect(resolveReportPeriod('2026-01', '2026-03')).toBe('2026-01');
  });

  it('maps last to the previous month across years', () => {
    expect(resolveReportPeriod('last', '2026-01')).toBe('2025-12');
  });

  it('falls back to the current month for missing or malformed values', () => {
    expect(resolveReportPeriod(undefined, '2026-03')).toBe('2026-03');
    expect(resolveReportPeriod('current', '2026-03')).toBe('2026-03');
    expect(resolveReportPeriod('foo', '2026-03')).toBe('2026-03');
    expect(resolveReportPeriod('2026-3', '2026-03')).toBe('2026-03');
    expect(resolveReportPeriod('2026-13', '2026-03')).toBe('2026-03');
  });
});
