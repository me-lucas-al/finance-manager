'use server';

import type { EntryActionResult } from '@/modules/finance/application/services/entry-action-service';
import { buildEntryActionService } from '@/modules/finance/infrastructure/build-entry-action-service';
import { getEffectiveUserId } from './require-session';

function entryActions() {
  return buildEntryActionService(getEffectiveUserId);
}

export async function createEntryAction(input: unknown): Promise<EntryActionResult> {
  return entryActions().create(input);
}

export async function updateEntryAction(input: unknown): Promise<EntryActionResult> {
  return entryActions().update(input);
}

export async function deleteEntryAction(input: unknown): Promise<EntryActionResult> {
  return entryActions().remove(input);
}
