import { InvestmentService } from '@/modules/investments/application/useCases/InvestmentService';
import { InvestmentDrizzleRepository } from '@/modules/investments/infra/repositories/InvestmentDrizzleRepository';
import { cacheTag } from 'next/cache';

const getInvestmentService = () => {
  return new InvestmentService(new InvestmentDrizzleRepository());
};

export async function getUserInvestmentsByPeriod(userId: string, periodId: string) {
  'use cache';
  cacheTag(`investments-${userId}-${periodId}`);
  
  const service = getInvestmentService();
  const investments = await service.getInvestmentsByPeriod(periodId);
  
  return investments.filter(investment => investment.userId === userId);
}

export async function getUserInvestmentById(userId: string, id: string) {
  'use cache';

  const service = getInvestmentService();
  const investment = await service.getInvestmentById(id);
  
  if (!investment || investment.userId !== userId) {
    return null;
  }
  
  return investment;
}

export async function getUserInvestments(userId: string) {
  'use cache';
  cacheTag(`investments-${userId}`);
  
  const service = getInvestmentService();
  return service.getInvestmentsByUser(userId);
}
