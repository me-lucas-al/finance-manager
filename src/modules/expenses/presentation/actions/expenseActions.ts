'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { ExpenseService } from '@/modules/expenses/application/useCases/ExpenseService';
import { ExpenseDrizzleRepository } from '@/modules/expenses/infra/repositories/ExpenseDrizzleRepository';
import { revalidatePath, revalidateTag } from 'next/cache';

const createExpenseSchema = z.object({
  periodId: z.string().uuid(),
  description: z.string().min(1),
  amount: z.number().int().positive(),
  category: z.string().min(1),
  date: z.string().datetime().or(z.date()).transform((val) => new Date(val)),
});

const updateExpenseSchema = createExpenseSchema.partial();

const getExpenseService = () => {
  return new ExpenseService(new ExpenseDrizzleRepository());
};

export async function createExpense(data: unknown) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = createExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: `Validation Error: ${parsed.error.message}` };
  }

  try {
    const service = getExpenseService();
    const expense = await service.createExpense({
      ...parsed.data,
      userId: session.userId,
    });

    revalidatePath('/dashboard');
    revalidateTag(`expenses-${parsed.data.periodId}`);
    
    return { success: true, data: expense };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateExpense(id: string, data: unknown) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = updateExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: `Validation Error: ${parsed.error.message}` };
  }

  try {
    const service = getExpenseService();
    const existing = await service.getExpenseById(id);
    
    if (!existing || existing.userId !== session.userId) {
      return { error: 'Unauthorized or Expense not found' };
    }

    const updated = await service.updateExpense(id, parsed.data);
    
    revalidatePath('/dashboard');
    revalidateTag(`expenses-${existing.periodId}`);
    
    return { success: true, data: updated };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteExpense(id: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Unauthorized' };
  }

  try {
    const service = getExpenseService();
    const existing = await service.getExpenseById(id);
    
    if (!existing || existing.userId !== session.userId) {
      return { error: 'Unauthorized or Expense not found' };
    }

    await service.deleteExpense(id);
    
    revalidatePath('/dashboard');
    revalidateTag(`expenses-${existing.periodId}`);
    
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
