import { EntryActionService } from '@/modules/finance/application/services/entry-action-service';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { deleteEntry, registerEntry, updateEntry } from './finance';

function reportUnexpectedError(error: unknown): void {
  console.error('Entry action failed:', error);
}

export const entryActionService = new EntryActionService({
  resolveUserId: requireUserId,
  registerEntry,
  updateEntry,
  deleteEntry,
  reportUnexpectedError,
});
