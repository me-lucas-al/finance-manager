import { describe, it, expect } from 'vitest';
import { toCreateInput, toUpdateInput } from '@/components/entries/entry-form-payload';
import { hasErrors, validateEntryValues } from '@/components/entries/entry-form-validation';
import { createEmptyEntryValues, valuesFromEntry, type EditableEntry, type EntryFormValues } from '@/components/entries/entry-form-values';

const filled: EntryFormValues = {
  type: 'expense',
  amount: '1.234,56',
  description: '  Mercado  ',
  category: ' Alimentação ',
  date: '2026-03-10',
  necessity: '',
  creditCardId: '',
};

const stored: EditableEntry = {
  kind: 'expense',
  id: 'e1',
  amount: 50,
  description: 'Almoço',
  category: 'Alimentação',
  date: '2026-03-01',
};

describe('entry form values', () => {
  it('starts empty with today as the date', () => {
    expect(createEmptyEntryValues('income', '2026-03-10')).toEqual({
      type: 'income',
      amount: '',
      description: '',
      category: '',
      date: '2026-03-10',
      necessity: '',
      creditCardId: '',
    });
  });

  it('fills the form from an existing entry with a masked amount', () => {
    expect(valuesFromEntry(stored)).toMatchObject({ type: 'expense', amount: '50,00', date: '2026-03-01' });
  });
});

describe('validateEntryValues', () => {
  it('accepts a complete form', () => {
    expect(hasErrors(validateEntryValues(filled))).toBe(false);
  });

  it('flags every missing or invalid field', () => {
    const errors = validateEntryValues({ ...filled, amount: '0,00', description: ' ', category: '', date: '2026-02-30' });

    expect(Object.keys(errors).sort()).toEqual(['amount', 'category', 'date', 'description']);
  });

  it('rejects an empty amount', () => {
    expect(validateEntryValues({ ...filled, amount: '' }).amount).toBeDefined();
  });
});

describe('toCreateInput', () => {
  it('parses the amount and trims text', () => {
    expect(toCreateInput(filled)).toEqual({
      type: 'expense',
      amount: 1234.56,
      description: 'Mercado',
      category: 'Alimentação',
      date: '2026-03-10',
    });
  });

  it('sends the informed necessity only for expenses', () => {
    expect(toCreateInput({ ...filled, necessity: 'superfluo' }).necessity).toBe('superfluo');
    expect(toCreateInput({ ...filled, type: 'income', necessity: 'superfluo' }).necessity).toBeUndefined();
  });
});

describe('toUpdateInput', () => {
  it('sends only the fields that changed', () => {
    const values = { ...valuesFromEntry(stored), amount: '75,00', date: '2026-03-02' };

    expect(toUpdateInput(stored, values)).toEqual({
      kind: 'expense',
      id: 'e1',
      changes: { amount: 75, date: '2026-03-02' },
    });
  });

  it('sends nothing when the form was not changed', () => {
    expect(toUpdateInput(stored, valuesFromEntry(stored)).changes).toEqual({});
  });

  it('includes a chosen necessity for expenses', () => {
    const values = { ...valuesFromEntry(stored), necessity: 'essencial' as const };

    expect(toUpdateInput(stored, values).changes).toEqual({ necessity: 'essencial' });
  });
});
