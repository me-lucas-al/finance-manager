import type { ZodType } from 'zod';
import { EntryNotFoundError, EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import {
  createFixedEntryServices,
} from '@/modules/finance/infrastructure/create-fixed-entry-services';
import type { FixedEntryServices } from '@/modules/finance/infrastructure/build-fixed-entry-services';
import { requireUserId } from './require-session';

export type FixedEntryActionResult = { ok: true } | { ok: false; error: string };

const INVALID_INPUT = 'Dados inválidos. Confira os campos e tente de novo.';
const GENERIC_FAILURE = 'Não foi possível concluir a operação agora.';

type FixedEntryWork<T> = (userId: string, data: T, services: FixedEntryServices) => Promise<unknown>;

export async function runFixedEntryAction<T>(
  schema: ZodType<T>,
  input: unknown,
  work: FixedEntryWork<T>
): Promise<FixedEntryActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };
  try {
    const userId = await requireUserId();
    await work(userId, parsed.data, createFixedEntryServices());
    return { ok: true };
  } catch (error) {
    if (error instanceof EntryValidationError || error instanceof EntryNotFoundError) {
      return { ok: false, error: error.message };
    }
    console.error('Fixed entry action failed:', error);
    return { ok: false, error: GENERIC_FAILURE };
  }
}
