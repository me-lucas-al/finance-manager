import { EntryNotFoundError, EntryValidationError } from '@/modules/finance/domain/models/entry-errors';

const GENERIC_FAILURE = 'Não foi possível concluir a operação agora.';

export async function reportFailure<T>(action: () => Promise<T>): Promise<T | { erro: string }> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof EntryNotFoundError || error instanceof EntryValidationError) return { erro: error.message };
    console.error('Advisor tool failed:', error);
    return { erro: GENERIC_FAILURE };
  }
}
