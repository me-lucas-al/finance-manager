import { describe, it, expect } from 'vitest';
import { toCreateInput, toUpdateInput } from '@/components/entries/entry-form-payload';
import {
  createEmptyEntryValues,
  valuesFromEntry,
  type EditableEntry,
} from '@/components/entries/entry-form-values';

const stored: EditableEntry = {
  kind: 'expense',
  id: 'e1',
  amount: 50,
  description: 'Almoço',
  category: 'Alimentação',
  date: '2026-03-01',
};

const filled = {
  ...createEmptyEntryValues('expense', '2026-03-10'),
  amount: '10,00',
  description: 'Mercado',
  category: 'Alimentação',
};

describe('card field on create', () => {
  it('sends the chosen card only for expenses', () => {
    expect(toCreateInput({ ...filled, creditCardId: 'card-1' }).creditCardId).toBe('card-1');
    expect(toCreateInput(filled).creditCardId).toBeUndefined();
    expect(toCreateInput({ ...filled, type: 'income', creditCardId: 'card-1' }).creditCardId).toBeUndefined();
  });
});

describe('card field on update', () => {
  it('links a card to an expense that had none', () => {
    const values = { ...valuesFromEntry(stored), creditCardId: 'card-1' };

    expect(toUpdateInput(stored, values).changes).toEqual({ creditCardId: 'card-1' });
  });

  it('unlinks the card by sending null', () => {
    const linked = { ...stored, creditCardId: 'card-1' };
    const values = { ...valuesFromEntry(linked), creditCardId: '' };

    expect(toUpdateInput(linked, values).changes).toEqual({ creditCardId: null });
  });

  it('does not resend an unchanged card', () => {
    const linked = { ...stored, creditCardId: 'card-1' };

    expect(toUpdateInput(linked, valuesFromEntry(linked)).changes).toEqual({});
  });
});
