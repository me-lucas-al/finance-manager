import { describe, it, expect } from 'vitest';
import { isValidEntryDate, assertValidEntryDate } from '@/modules/finance/domain/parsers/parse-entry-date';

describe('isValidEntryDate', () => {
  it('accepts real calendar dates', () => {
    expect(isValidEntryDate('2026-02-28')).toBe(true);
    expect(isValidEntryDate('2028-02-29')).toBe(true);
  });

  it('rejects wrong formats and impossible dates', () => {
    expect(isValidEntryDate('abc')).toBe(false);
    expect(isValidEntryDate('2026-3-5')).toBe(false);
    expect(isValidEntryDate('2026-02-30')).toBe(false);
    expect(isValidEntryDate('2027-02-29')).toBe(false);
    expect(isValidEntryDate('2026-13-01')).toBe(false);
  });

  it('throws on assert with an invalid date', () => {
    expect(() => assertValidEntryDate('2026-02-30')).toThrow('Invalid entry date');
  });
});
