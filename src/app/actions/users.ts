'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { getSession } from '../../modules/auth/application/session';
import { UpdateSettingUseCase, GetSettingUseCase } from '../../modules/users/application/use-cases/manage-setting';
import { DrizzleSettingRepository } from '../../modules/users/infrastructure/repositories';

const updateSettingsSchema = z.object({
  periodStartDay: z.coerce.number().min(1).max(31).optional(),
  periodEndDay: z.coerce.number().min(1).max(31).optional(),
  maxExpensesPercentage: z.coerce.number().min(0).max(100).optional(),
  minInvestmentPercentage: z.coerce.number().min(0).max(100).optional(),
  // For arrays, FormData handling might be complex, let's allow stringified JSON or plain strings
  expenseCategories: z.string().optional(),
  investmentTypes: z.string().optional(),
});

export async function updateUserSettings(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = updateSettingsSchema.parse(rawData);

  // If we receive stringified arrays, parse them
  let expenseCategories: string[] | undefined;
  let investmentTypes: string[] | undefined;

  if (parsedData.expenseCategories) {
    try { expenseCategories = JSON.parse(parsedData.expenseCategories); } catch {}
  }
  if (parsedData.investmentTypes) {
    try { investmentTypes = JSON.parse(parsedData.investmentTypes); } catch {}
  }

  const dataToUpdate: any = { ...parsedData };
  if (expenseCategories) dataToUpdate.expenseCategories = expenseCategories;
  if (investmentTypes) dataToUpdate.investmentTypes = investmentTypes;
  
  const repo = new DrizzleSettingRepository();
  const existing = await repo.findByUserId(session.user.id);

  if (!existing) {
    throw new Error('Settings not found');
  }

  const useCase = new UpdateSettingUseCase(repo);
  await useCase.execute(existing.id, dataToUpdate);

  revalidateTag(`settings-${session.user.id}`, 'max');
}

async function fetchUserSettingsCached(userId: string) {
  'use cache';
  const { cacheTag } = await import('next/cache');
  cacheTag(`settings-${userId}`);
  
  const repo = new DrizzleSettingRepository();
  return await repo.findByUserId(userId);
}

export async function getUserSettings() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return fetchUserSettingsCached(session.user.id);
}
