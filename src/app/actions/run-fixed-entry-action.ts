import type { ZodType } from 'zod';
import { EntryNotFoundError, EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';

export type FixedEntryActionResult = { ok: true } | { ok: false; error: string };

const INVALID_INPUT = 'Dados inválidos. Confira os campos e tente de novo.';
const GENERIC_FAILURE = 'Não foi possível concluir a operação agora.';

type FixedEntryWork<T> = (userId: string, data: T) => Promise<unknown>;

export async function runFixedEntryAction<T>(
  schema: ZodType<T>,
  input: unknown,
  work: FixedEntryWork<T>
): Promise<FixedEntryActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };
  try {
    await work(await requireUserId(), parsed.data);
    return { ok: true };
  } catch (error) {
    if (error instanceof EntryValidationError || error instanceof EntryNotFoundError) {
      return { ok: false, error: error.message };
    }
    console.error('Fixed entry action failed:', error);
    return { ok: false, error: GENERIC_FAILURE };
  }
}
