'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { InvestmentService } from '@/modules/investments/application/useCases/InvestmentService';
import { InvestmentDrizzleRepository } from '@/modules/investments/infra/repositories/InvestmentDrizzleRepository';
import { revalidatePath, updateTag } from 'next/cache';

const createInvestmentSchema = z.object({
  periodId: z.string().uuid(),
  description: z.string().min(1),
  amount: z.number().int().positive(),
  type: z.string().min(1),
  date: z.string().datetime().or(z.date()).transform((val) => new Date(val)),
});

const updateInvestmentSchema = createInvestmentSchema.partial();

const getInvestmentService = () => {
  return new InvestmentService(new InvestmentDrizzleRepository());
};

export async function createInvestment(data: unknown) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = createInvestmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: `Validation Error: ${parsed.error.message}` };
  }

  try {
    const service = getInvestmentService();
    const investment = await service.createInvestment({
      ...parsed.data,
      userId: session.userId,
    });

    revalidatePath('/dashboard');
    updateTag(`investments-${session.userId}-${parsed.data.periodId}`);
    
    return { success: true, data: investment };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateInvestment(id: string, data: unknown) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = updateInvestmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: `Validation Error: ${parsed.error.message}` };
  }

  try {
    const service = getInvestmentService();
    const existing = await service.getInvestmentById(id, session.userId);
    
    if (!existing || existing.userId !== session.userId) {
      return { error: 'Unauthorized or Investment not found' };
    }

    const updated = await service.updateInvestment(id, session.userId, parsed.data);
    
    revalidatePath('/dashboard');
    updateTag(`investments-${session.userId}-${existing.periodId}`);
    
    return { success: true, data: updated };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteInvestment(id: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  try {
    const service = getInvestmentService();
    const existing = await service.getInvestmentById(id, session.userId);
    
    if (!existing || existing.userId !== session.userId) {
      return { error: 'Unauthorized or Investment not found' };
    }

    await service.deleteInvestment(id, session.userId);
    
    revalidatePath('/dashboard');
    updateTag(`investments-${session.userId}-${existing.periodId}`);
    
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
