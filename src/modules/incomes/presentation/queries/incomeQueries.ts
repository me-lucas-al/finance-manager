import { IncomeService } from '@/modules/incomes/application/useCases/IncomeService';
import { IncomeDrizzleRepository } from '@/modules/incomes/infra/repositories/IncomeDrizzleRepository';
import { cacheTag } from 'next/cache';

const getIncomeService = () => {
  return new IncomeService(new IncomeDrizzleRepository());
};

export async function getUserIncomesByPeriod(userId: string, periodId: string) {
  'use cache';
  cacheTag(`incomes-${userId}-${periodId}`);
  
  const service = getIncomeService();
  const incomes = await service.getIncomesByPeriod(periodId, userId);
  
  return incomes;
}

export async function getUserIncomeById(userId: string, id: string) {
  'use cache';

  const service = getIncomeService();
  const income = await service.getIncomeById(id, userId);
  
  if (!income || income.userId !== userId) {
    return null;
  }
  
  return income;
}
