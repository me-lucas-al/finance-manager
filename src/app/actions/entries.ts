'use server';

import { entryActionService } from '@/composition/entry-actions';
import type { EntryActionResult } from '@/modules/finance/application/services/entry-action-service';

export async function createEntryAction(input: unknown): Promise<EntryActionResult> {
  return entryActionService.create(input);
}

export async function updateEntryAction(input: unknown): Promise<EntryActionResult> {
  return entryActionService.update(input);
}

export async function deleteEntryAction(input: unknown): Promise<EntryActionResult> {
  return entryActionService.remove(input);
}
