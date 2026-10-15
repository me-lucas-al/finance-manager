import { describe, it, expect } from 'vitest';
import { validateFixedEntryChanges, validateNewFixedEntry } from '@/modules/finance/domain/services/validate-fixed-entry';
import { EntryValidationError } from '@/modules/finance/domain/models/entry-errors';

const valid = { kind: 'expense' as const, description: 'Internet', amount: 120, category: 'Moradia', dueDay: 10 };

describe('validateNewFixedEntry', () => {
  it('accepts a complete input', () => {
    expect(() => validateNewFixedEntry(valid)).not.toThrow();
  });

  it.each([
    ['amount', { amount: 0 }],
    ['amount', { amount: Number.NaN }],
    ['dueDay', { dueDay: 0 }],
    ['dueDay', { dueDay: 32 }],
    ['dueDay', { dueDay: 1.5 }],
    ['description', { description: '  ' }],
    ['category', { category: '' }],
  ])('rejects invalid %s', (_field, override) => {
    expect(() => validateNewFixedEntry({ ...valid, ...override })).toThrow(EntryValidationError);
  });
});

describe('validateFixedEntryChanges', () => {
  it('requires at least one change', () => {
    expect(() => validateFixedEntryChanges({})).toThrow(EntryValidationError);
  });

  it('validates only the provided fields', () => {
    expect(() => validateFixedEntryChanges({ dueDay: 31 })).not.toThrow();
    expect(() => validateFixedEntryChanges({ amount: -1 })).toThrow(EntryValidationError);
  });
});
