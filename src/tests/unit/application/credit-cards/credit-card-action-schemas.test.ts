import { describe, it, expect } from 'vitest';
import {
  createCreditCardSchema,
  deleteCreditCardSchema,
  updateCreditCardSchema,
} from '@/app/actions/credit-card-schemas';

describe('credit card action schemas', () => {
  it('accepts a minimal create payload', () => {
    expect(createCreditCardSchema.safeParse({ name: 'Nubank', creditLimit: 0 }).success).toBe(true);
  });

  it('rejects bad digits, negative limit and out of range closing day', () => {
    const base = { name: 'Nubank', creditLimit: 100 };

    expect(createCreditCardSchema.safeParse({ ...base, lastDigits: '12' }).success).toBe(false);
    expect(createCreditCardSchema.safeParse({ ...base, creditLimit: -1 }).success).toBe(false);
    expect(createCreditCardSchema.safeParse({ ...base, closingDay: 40 }).success).toBe(false);
    expect(createCreditCardSchema.safeParse({ name: '  ', creditLimit: 1 }).success).toBe(false);
  });

  it('accepts null to clear optional fields on update', () => {
    const parsed = updateCreditCardSchema.safeParse({ id: 'card-1', lastDigits: null, closingDay: null });

    expect(parsed.success).toBe(true);
  });

  it('requires an id to update or delete', () => {
    expect(updateCreditCardSchema.safeParse({ name: 'X' }).success).toBe(false);
    expect(deleteCreditCardSchema.safeParse({ id: '' }).success).toBe(false);
  });
});
