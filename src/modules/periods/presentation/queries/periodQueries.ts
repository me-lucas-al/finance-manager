import { PeriodService } from '@/modules/periods/application/useCases/PeriodService';
import { PeriodDrizzleRepository } from '@/modules/periods/infra/repositories/PeriodDrizzleRepository';
import { cacheTag } from 'next/cache';

const getPeriodService = () => {
  return new PeriodService(new PeriodDrizzleRepository());
};

export async function getUserPeriodsData(userId: string) {
  'use cache';
  cacheTag(`periods-${userId}`);
  
  const service = getPeriodService();
  const periods = await service.getUserPeriods(userId);
  
  return periods;
}

export async function getUserPeriodById(userId: string, id: string) {
  'use cache';

  const service = getPeriodService();
  const period = await service.getPeriodById(id);
  
  if (!period || period.userId !== userId) {
    return null;
  }
  
  return period;
}
