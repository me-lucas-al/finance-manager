import { describe, it, expect } from 'vitest';
import { EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import {
  validateCreditCardChanges,
  validateNewCreditCard,
} from '@/modules/finance/domain/services/validate-credit-card';

describe('validateNewCreditCard', () => {
  it('accepts a minimal card', () => {
    expect(() => validateNewCreditCard({ name: 'Nubank', creditLimit: 0 })).not.toThrow();
  });

  it('rejects blank names', () => {
    expect(() => validateNewCreditCard({ name: '  ', creditLimit: 100 })).toThrow(EntryValidationError);
  });

  it('rejects negative or non-finite limits', () => {
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: -1 })).toThrow('Limite');
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: Number.NaN })).toThrow('Limite');
  });

  it('requires exactly four digits when provided', () => {
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, lastDigits: '12a4' })).toThrow('4 dígitos');
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, lastDigits: '123' })).toThrow('4 dígitos');
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, lastDigits: '1234' })).not.toThrow();
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, lastDigits: null })).not.toThrow();
  });

  it('keeps the closing day between 1 and 31', () => {
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, closingDay: 0 })).toThrow('fechamento');
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, closingDay: 32 })).toThrow('fechamento');
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, closingDay: 15.5 })).toThrow('fechamento');
    expect(() => validateNewCreditCard({ name: 'A', creditLimit: 1, closingDay: 31 })).not.toThrow();
  });
});

describe('validateCreditCardChanges', () => {
  it('rejects empty changes', () => {
    expect(() => validateCreditCardChanges({})).toThrow('Nenhuma alteração');
  });

  it('validates only the provided fields', () => {
    expect(() => validateCreditCardChanges({ closingDay: null })).not.toThrow();
    expect(() => validateCreditCardChanges({ name: '' })).toThrow(EntryValidationError);
  });
});
