import { describe, it, expect } from 'vitest';
import { toUpdateInput } from '@/components/entries/entry-form-payload';
import { valuesFromEntry, type EditableEntry } from '@/components/entries/entry-form-values';

const entry: EditableEntry = {
  kind: 'expense',
  id: 'e1',
  amount: 50,
  description: 'Almoço',
  category: 'Alimentação',
  date: '2026-03-01',
  necessity: 'essencial',
};

describe('toUpdateInput necessity handling', () => {
  it('keeps the current necessity when other fields change so it is not reclassified', () => {
    const values = { ...valuesFromEntry(entry), description: 'Almoço executivo' };

    expect(toUpdateInput(entry, values).changes).toEqual({ description: 'Almoço executivo', necessity: 'essencial' });
  });

  it('sends nothing when nothing was touched', () => {
    expect(toUpdateInput(entry, valuesFromEntry(entry)).changes).toEqual({});
  });

  it('sends a newly chosen necessity on its own', () => {
    const values = { ...valuesFromEntry(entry), necessity: 'superfluo' as const };

    expect(toUpdateInput(entry, values).changes).toEqual({ necessity: 'superfluo' });
  });

  it('never sends necessity for incomes or investments', () => {
    const income = { ...entry, kind: 'income' as const };
    const values = { ...valuesFromEntry(income), amount: '75,00' };

    expect(toUpdateInput(income, values).changes).toEqual({ amount: 75 });
  });
});
