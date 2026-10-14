'use server';

import { z } from 'zod';
import { updateTag, revalidatePath } from 'next/cache';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { ledgerCacheTag } from '@/modules/finance/application/services/ledger-cache-tag';
import { settingRepository, updateSetting } from '@/composition/users';
import type { NewSetting } from '@/modules/users/domain/models/setting';

const jsonStringArray = z.string().transform((val, ctx) => {
  try {
    return JSON.parse(val);
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
    return z.NEVER;
  }
}).pipe(z.array(z.string()));

const updateSettingsSchema = z.object({
  periodStartDay: z.coerce.number().min(1).max(31).optional(),
  periodEndDay: z.coerce.number().min(1).max(31).optional(),
  maxExpensesPercentage: z.coerce.number().min(0).max(100).optional(),
  minInvestmentPercentage: z.coerce.number().min(0).max(100).optional(),
  initialBalance: z.coerce.number().optional(),
  expenseCategories: jsonStringArray.optional(),
  investmentTypes: jsonStringArray.optional(),
});

export async function updateUserSettings(formData: FormData) {
  const userId = await requireUserId();

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = updateSettingsSchema.parse(rawData);

  const dataToUpdate: Partial<NewSetting> = {
    periodStartDay: parsedData.periodStartDay,
    periodEndDay: parsedData.periodEndDay,
    maxExpensesPercentage: parsedData.maxExpensesPercentage,
    minInvestmentPercentage: parsedData.minInvestmentPercentage,
  };
  if (parsedData.initialBalance !== undefined) dataToUpdate.initialBalance = parsedData.initialBalance.toFixed(2);
  if (parsedData.expenseCategories) dataToUpdate.expenseCategories = parsedData.expenseCategories;
  if (parsedData.investmentTypes) dataToUpdate.investmentTypes = parsedData.investmentTypes;

  const existing = await settingRepository.findByUserId(userId);

  if (!existing) {
    throw new Error('Settings not found');
  }

  await updateSetting.execute(existing.id, dataToUpdate);

  updateTag(`settings-${userId}`);
  updateTag(ledgerCacheTag(userId));
}

async function fetchUserSettingsCached(userId: string) {
  'use cache';
  const { cacheTag } = await import('next/cache');
  cacheTag(`settings-${userId}`);

  return settingRepository.findByUserId(userId);
}

export async function getUserSettings() {
  const userId = await requireUserId();
  return fetchUserSettingsCached(userId);
}

export async function updateUserProfile(name: string) {
  const userId = await requireUserId();
  const { getSupabaseAdmin } = await import('@/shared/infrastructure/supabase-admin');
  const { error } = await getSupabaseAdmin()
    .from('users')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/settings');
  revalidatePath('/', 'layout');
}
