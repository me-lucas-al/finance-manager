'use server';

import { z } from 'zod';
import { runFixedEntryAction, type FixedEntryActionResult } from './run-fixed-entry-action';

const text = z.string().trim().min(1);
const amount = z.number().positive();
const dueDay = z.number().int().min(1).max(31);

const createSchema = z.object({
  kind: z.enum(['expense', 'income']),
  description: text,
  category: text,
  amount,
  dueDay,
  launchThisMonth: z.boolean().optional(),
});

const updateSchema = z.object({
  id: text,
  description: text.optional(),
  category: text.optional(),
  amount: amount.optional(),
  dueDay: dueDay.optional(),
  applyToCurrentMonth: z.boolean().optional(),
});

const setActiveSchema = z.object({ id: text, active: z.boolean() });

const deleteSchema = z.object({ id: text, alsoDeleteCurrentMonth: z.boolean().optional() });

export async function createFixedEntryAction(input: unknown): Promise<FixedEntryActionResult> {
  return runFixedEntryAction(createSchema, input, (userId, data, services) => services.create.execute(userId, data));
}

export async function updateFixedEntryAction(input: unknown): Promise<FixedEntryActionResult> {
  return runFixedEntryAction(updateSchema, input, (userId, { id, ...changes }, services) =>
    services.update.execute(userId, id, changes)
  );
}

export async function setFixedEntryActiveAction(input: unknown): Promise<FixedEntryActionResult> {
  return runFixedEntryAction(setActiveSchema, input, (userId, { id, active }, services) =>
    services.setActive.execute(userId, id, active)
  );
}

export async function deleteFixedEntryAction(input: unknown): Promise<FixedEntryActionResult> {
  return runFixedEntryAction(deleteSchema, input, (userId, { id, alsoDeleteCurrentMonth }, services) =>
    services.remove.execute(userId, id, { alsoDeleteCurrentMonth })
  );
}
