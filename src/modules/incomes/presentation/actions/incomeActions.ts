'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { IncomeService } from '@/modules/incomes/application/useCases/IncomeService';
import { IncomeDrizzleRepository } from '@/modules/incomes/infra/repositories/IncomeDrizzleRepository';
import { revalidatePath, updateTag } from 'next/cache';

const createIncomeSchema = z.object({
  periodId: z.string().uuid(),
  description: z.string().min(1),
  amount: z.number().int().positive(),
  category: z.string().min(1),
  receivedAt: z.string().datetime().or(z.date()).transform((val) => new Date(val)),
});

const updateIncomeSchema = createIncomeSchema.partial();

const getIncomeService = () => {
  return new IncomeService(new IncomeDrizzleRepository());
};

export async function createIncome(data: unknown) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = createIncomeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: `Validation Error: ${parsed.error.message}` };
  }

  try {
    const service = getIncomeService();
    const income = await service.createIncome({
      ...parsed.data,
      userId: session.userId,
    });

    revalidatePath('/dashboard');
    updateTag(`incomes-${session.userId}-${parsed.data.periodId}`);
    
    return { success: true, data: income };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateIncome(id: string, data: unknown) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = updateIncomeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: `Validation Error: ${parsed.error.message}` };
  }

  try {
    const service = getIncomeService();
    const existing = await service.getIncomeById(id, session.userId);
    
    if (!existing || existing.userId !== session.userId) {
      return { error: 'Unauthorized or Income not found' };
    }

    const updated = await service.updateIncome(id, session.userId, parsed.data);
    
    revalidatePath('/dashboard');
    updateTag(`incomes-${session.userId}-${existing.periodId}`);
    
    return { success: true, data: updated };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteIncome(id: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  try {
    const service = getIncomeService();
    const existing = await service.getIncomeById(id, session.userId);
    
    if (!existing || existing.userId !== session.userId) {
      return { error: 'Unauthorized or Income not found' };
    }

    await service.deleteIncome(id, session.userId);
    
    revalidatePath('/dashboard');
    updateTag(`incomes-${session.userId}-${existing.periodId}`);
    
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
