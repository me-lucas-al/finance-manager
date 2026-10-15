import { z } from 'zod';

const id = z.string().trim().min(1);
const name = z.string().trim().min(1).max(60);
const lastDigits = z.string().regex(/^\d{4}$/).nullable();
const creditLimit = z.number().finite().min(0);
const closingDay = z.number().int().min(1).max(31).nullable();

export const createCreditCardSchema = z.object({
  name,
  lastDigits: lastDigits.optional(),
  creditLimit,
  closingDay: closingDay.optional(),
});

export const updateCreditCardSchema = z.object({
  id,
  name: name.optional(),
  lastDigits: lastDigits.optional(),
  creditLimit: creditLimit.optional(),
  closingDay: closingDay.optional(),
});

export const deleteCreditCardSchema = z.object({ id });
