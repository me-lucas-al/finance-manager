import { describe, it, expect } from 'vitest';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';
import {
  initialCreditCardFormValues,
  parseCreditCardForm,
} from '@/components/cards/credit-card-form-values';

const valid = { name: 'Nubank', lastDigits: '1234', limit: '5.000,00', closingDay: '10' };

describe('parseCreditCardForm', () => {
  it('parses a complete form', () => {
    expect(parseCreditCardForm(valid)).toEqual({
      payload: { name: 'Nubank', lastDigits: '1234', creditLimit: 5000, closingDay: 10 },
    });
  });

  it('turns blank optionals into null and a blank limit into zero', () => {
    expect(parseCreditCardForm({ name: ' Inter ', lastDigits: '', limit: '', closingDay: '' })).toEqual({
      payload: { name: 'Inter', lastDigits: null, creditLimit: 0, closingDay: null },
    });
  });

  it('rejects a missing name', () => {
    expect(parseCreditCardForm({ ...valid, name: ' ' })).toEqual({ error: 'Informe o nome do cartão.' });
  });

  it('rejects digits that are not four numbers', () => {
    expect(parseCreditCardForm({ ...valid, lastDigits: '12' })).toEqual({ error: 'O final do cartão tem 4 dígitos.' });
    expect(parseCreditCardForm({ ...valid, lastDigits: '12ab' })).toEqual({ error: 'O final do cartão tem 4 dígitos.' });
  });

  it('rejects an invalid limit and closing day', () => {
    expect(parseCreditCardForm({ ...valid, limit: 'abc' })).toEqual({ error: 'Informe um limite válido ou deixe em branco.' });
    expect(parseCreditCardForm({ ...valid, closingDay: '32' })).toEqual({ error: 'O dia de fechamento vai de 1 a 31.' });
    expect(parseCreditCardForm({ ...valid, closingDay: '1.5' })).toEqual({ error: 'O dia de fechamento vai de 1 a 31.' });
  });
});

describe('initialCreditCardFormValues', () => {
  it('starts empty for a new card', () => {
    expect(initialCreditCardFormValues()).toEqual({ name: '', lastDigits: '', limit: '', closingDay: '' });
  });

  it('prefills from an existing card', () => {
    const card = makeCreditCard({ name: 'Nubank', lastDigits: '9876', creditLimit: 1500.5, closingDay: null });

    expect(initialCreditCardFormValues(card)).toEqual({
      name: 'Nubank',
      lastDigits: '9876',
      limit: '1500,5',
      closingDay: '',
    });
  });
});
