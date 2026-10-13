import { OwnerResolutionError } from '@/modules/auth/domain/resolve-owner-user-id';
import { EntryNotFoundError, EntryValidationError } from '../../domain/models/entry-errors';

export const SESSION_EXPIRED_MESSAGE = 'Sessão expirada. Entre novamente.';
export const UNEXPECTED_FAILURE_MESSAGE = 'Não foi possível salvar. Tente novamente.';

export function describeEntryActionFailure(error: unknown, reportUnexpectedError: (error: unknown) => void): string {
  if (error instanceof EntryValidationError || error instanceof EntryNotFoundError) return error.message;
  if (error instanceof OwnerResolutionError) return SESSION_EXPIRED_MESSAGE;
  reportUnexpectedError(error);
  return UNEXPECTED_FAILURE_MESSAGE;
}
