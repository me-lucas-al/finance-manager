'use server';

import { z } from 'zod';
import { refresh } from 'next/cache';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { listExpenseCategories, updateGoalsFromMessage, upsertGoal } from '@/composition/open-finance';

const amountSchema = z.coerce.number().positive();

function readAmount(formData: FormData, field: string): number | null {
  const raw = formData.get(field);
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  return amountSchema.parse(raw);
}

export async function saveMonthlyGoals(month: string, formData: FormData) {
  const userId = await requireUserId();

  const generalAmount = readAmount(formData, 'general');
  if (generalAmount !== null) {
    await upsertGoal.execute({ userId, month, category: null, targetAmount: generalAmount });
  }

  const categories = await listExpenseCategories(userId);
  for (const category of categories) {
    const amount = readAmount(formData, `category__${category}`);
    if (amount !== null) {
      await upsertGoal.execute({ userId, month, category, targetAmount: amount });
    }
  }

  refresh();
}

export async function sendGoalsChatMessage(message: string): Promise<string> {
  const userId = await requireUserId();

  const confirmation = await updateGoalsFromMessage.execute(userId, message);
  refresh();
  return confirmation;
}
