'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { getSession } from '../../modules/auth/application/session';
import { UpdateSettingUseCase } from '../../modules/users/application/use-cases/manage-setting';
import { DrizzleSettingRepository } from '../../modules/users/infrastructure/repositories';
import type { NewSetting } from '../../modules/users/domain/repositories/setting-repository';

// Arrays arrive as a JSON-encoded string in FormData; parse and validate the
// shape so a malformed payload fails loudly instead of being persisted as-is.
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
  expenseCategories: jsonStringArray.optional(),
  investmentTypes: jsonStringArray.optional(),
});

export async function updateUserSettings(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const parsedData = updateSettingsSchema.parse(rawData);

  const dataToUpdate: Partial<NewSetting> = {
    periodStartDay: parsedData.periodStartDay,
    periodEndDay: parsedData.periodEndDay,
    maxExpensesPercentage: parsedData.maxExpensesPercentage,
    minInvestmentPercentage: parsedData.minInvestmentPercentage,
  };
  if (parsedData.expenseCategories) dataToUpdate.expenseCategories = parsedData.expenseCategories;
  if (parsedData.investmentTypes) dataToUpdate.investmentTypes = parsedData.investmentTypes;

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
