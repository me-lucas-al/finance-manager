'use server';

import { listExpenseCategories } from '@/composition/open-finance';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';

export async function listExpenseCategoriesAction(): Promise<string[]> {
  try {
    return await listExpenseCategories(await requireUserId());
  } catch (error) {
    console.error('Listing expense categories failed:', error);
    return [];
  }
}
