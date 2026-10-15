import { describe, it, expect } from 'vitest';
import { calculateFixedEntryStatus } from '@/modules/finance/domain/services/calculate-fixed-entry-status';

const base = { active: true, launched: false, dueDate: '2026-03-10', startsOn: '2026-01-01' };

describe('calculateFixedEntryStatus', () => {
  it('is launched when the month already has the entry', () => {
    expect(calculateFixedEntryStatus({ ...base, launched: true })).toBe('launched');
  });

  it('keeps launched even if the rule was paused afterwards', () => {
    expect(calculateFixedEntryStatus({ ...base, launched: true, active: false })).toBe('launched');
  });

  it('is paused when inactive and not launched', () => {
    expect(calculateFixedEntryStatus({ ...base, active: false })).toBe('paused');
  });

  it('is scheduled when active and not launched yet', () => {
    expect(calculateFixedEntryStatus(base)).toBe('scheduled');
  });

  it('is skipped when the due date is before the rule start', () => {
    expect(calculateFixedEntryStatus({ ...base, startsOn: '2026-03-20' })).toBe('skipped');
  });

  it('is scheduled when the due date equals the rule start', () => {
    expect(calculateFixedEntryStatus({ ...base, startsOn: '2026-03-10' })).toBe('scheduled');
  });
});
