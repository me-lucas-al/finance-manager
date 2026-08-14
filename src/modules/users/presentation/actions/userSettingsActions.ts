'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { UserSettingsService } from '@/modules/users/application/useCases/UserSettingsService';
import { UserSettingsDrizzleRepository } from '@/modules/users/infra/repositories/UserSettingsDrizzleRepository';
import { revalidatePath, revalidateTag } from 'next/cache';

const updateUserSettingsSchema = z.object({
  periodStartDay: z.number().int().min(1).max(31).optional(),
  periodEndDay: z.number().int().min(1).max(31).optional(),
  maxExpensesPercentage: z.number().int().min(0).max(100).optional(),
  minInvestmentPercentage: z.number().int().min(0).max(100).optional(),
  expenseCategories: z.array(z.string()).optional(),
  investmentTypes: z.array(z.string()).optional(),
});

const getUserSettingsService = () => {
  return new UserSettingsService(new UserSettingsDrizzleRepository());
};

export async function getUserSettings() {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  try {
    const service = getUserSettingsService();
    let settings = await service.getUserSettings(session.userId);
    
    // Auto-create settings if they don't exist yet
    if (!settings) {
      settings = await service.createUserSettings({ userId: session.userId });
    }

    return { success: true, data: settings };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateUserSettings(data: unknown) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = updateUserSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: `Validation Error: ${parsed.error.message}` };
  }

  try {
    const service = getUserSettingsService();
    
    // Ensure settings exist first
    const existing = await service.getUserSettings(session.userId);
    if (!existing) {
      await service.createUserSettings({ userId: session.userId });
    }

    const updated = await service.updateUserSettings(session.userId, parsed.data);
    
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    revalidateTag(`user-settings-${session.userId}`);
    
    return { success: true, data: updated };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
