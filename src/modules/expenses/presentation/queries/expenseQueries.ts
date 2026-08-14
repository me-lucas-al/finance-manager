import { ExpenseService } from '@/modules/expenses/application/useCases/ExpenseService';
import { ExpenseDrizzleRepository } from '@/modules/expenses/infra/repositories/ExpenseDrizzleRepository';
import { cacheTag } from 'next/cache';

const getExpenseService = () => {
  return new ExpenseService(new ExpenseDrizzleRepository());
};

export async function getUserExpensesByPeriod(userId: string, periodId: string) {
  'use cache';
  cacheTag(`expenses-${userId}-${periodId}`);
  
  const service = getExpenseService();
  const expenses = await service.getExpensesByPeriod(periodId);
  
  return expenses.filter(expense => expense.userId === userId);
}

export async function getUserExpenseById(userId: string, id: string) {
  'use cache';

  const service = getExpenseService();
  const expense = await service.getExpenseById(id);
  
  if (!expense || expense.userId !== userId) {
    return null;
  }
  
  return expense;
}
