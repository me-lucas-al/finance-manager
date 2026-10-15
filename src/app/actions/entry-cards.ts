'use server';

import { listCardOptions } from '@/composition/credit-card-views';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import type { CardOption } from '@/modules/finance/domain/models/credit-card';

export async function listCardOptionsAction(): Promise<CardOption[]> {
  try {
    return await listCardOptions(await requireUserId());
  } catch (error) {
    console.error('Listing card options failed:', error);
    return [];
  }
}
