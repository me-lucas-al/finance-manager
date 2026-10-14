import { EntryNotFoundError, EntryValidationError } from '../../domain/models/entry-errors';

export const SESSION_EXPIRED_MESSAGE = 'Sessão expirada. Entre novamente.';
export const UNEXPECTED_FAILURE_MESSAGE = 'Não foi possível salvar. Tente novamente.';

const UNAUTHORIZED_MESSAGE = 'Unauthorized';

export function describeEntryActionFailure(error: unknown, reportUnexpectedError: (error: unknown) => void): string {
  if (error instanceof EntryValidationError || error instanceof EntryNotFoundError) return error.message;
  if (error instanceof Error && error.message === UNAUTHORIZED_MESSAGE) return SESSION_EXPIRED_MESSAGE;
  reportUnexpectedError(error);
  return UNEXPECTED_FAILURE_MESSAGE;
}
