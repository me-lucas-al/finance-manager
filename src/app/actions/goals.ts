'use server';

import { z } from 'zod';
import { refresh } from 'next/cache';
import { requireUserId } from './require-session';
import { SupabaseGoalRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { UpsertGoalUseCase } from '@/modules/open-finance/application/use-cases/manage-goal';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';

const amountSchema = z.coerce.number().positive();

function readAmount(formData: FormData, field: string): number | null {
  const raw = formData.get(field);
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  return amountSchema.parse(raw);
}

// One submit saves the general goal plus every category goal filled in the
// form; fields left blank are simply not touched (no goal is created/changed).
export async function saveMonthlyGoals(month: string, formData: FormData) {
  const userId = await requireUserId();
  const useCase = new UpsertGoalUseCase(new SupabaseGoalRepository());

  const generalAmount = readAmount(formData, 'general');
  if (generalAmount !== null) {
    await useCase.execute({ userId, month, category: null, targetAmount: generalAmount });
  }

  const categories = await getExpenseCategories(userId);
  for (const category of categories) {
    const amount = readAmount(formData, `category__${category}`);
    if (amount !== null) {
      await useCase.execute({ userId, month, category, targetAmount: amount });
    }
  }

  refresh();
}
