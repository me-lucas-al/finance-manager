'use server';

import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { getEffectiveUserId } from './require-session';

export async function listExpenseCategoriesAction(): Promise<string[]> {
  try {
    return await getExpenseCategories(await getEffectiveUserId());
  } catch {
    return [];
  }
}
