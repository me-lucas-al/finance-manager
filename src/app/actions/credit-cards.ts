'use server';

import { createCreditCard, deleteCreditCard, updateCreditCard } from '@/composition/credit-cards';
import {
  createCreditCardSchema,
  deleteCreditCardSchema,
  updateCreditCardSchema,
} from './credit-card-schemas';
import { runFixedEntryAction as runCardAction, type FixedEntryActionResult } from './run-fixed-entry-action';

export async function createCreditCardAction(input: unknown): Promise<FixedEntryActionResult> {
  return runCardAction(createCreditCardSchema, input, (userId, data) => createCreditCard.execute(userId, data));
}

export async function updateCreditCardAction(input: unknown): Promise<FixedEntryActionResult> {
  return runCardAction(updateCreditCardSchema, input, (userId, { id, ...changes }) =>
    updateCreditCard.execute(userId, id, changes)
  );
}

export async function deleteCreditCardAction(input: unknown): Promise<FixedEntryActionResult> {
  return runCardAction(deleteCreditCardSchema, input, (userId, { id }) => deleteCreditCard.execute(userId, id));
}
