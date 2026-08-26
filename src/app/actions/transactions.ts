'use server';

import { z } from 'zod';
import { refresh } from 'next/cache';
import { requireUserId, requireOwnedEntity } from './require-session';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

const updateSchema = z.object({
  category: z.string().min(1),
  reason: z.string().optional(),
});

// Only category/reason are user-editable: description/amount/date/bank come
// straight from the bank via Pluggy and shouldn't be overwritten manually.
export async function updateTransactionCategorization(id: string, formData: FormData) {
  const userId = await requireUserId();
  const repository = new SupabaseTransactionRepository();
  await requireOwnedEntity(repository, id, userId);

  const parsed = updateSchema.parse(Object.fromEntries(formData.entries()));
  await repository.update(id, {
    category: parsed.category,
    reason: parsed.reason && parsed.reason.trim() !== '' ? parsed.reason.trim() : null,
    status: 'categorized',
  });

  refresh();
}
