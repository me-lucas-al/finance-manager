import { createCreditCardOverviewService } from '@/modules/finance/application/services/credit-card-overview-service';
import { listCreditCardUsage } from './credit-cards';
import { dataModeStore } from './onboarding';

export const readDataMode = async (userId: string) => (await dataModeStore.getState(userId)).dataMode;

export const getCreditCardOverview = createCreditCardOverviewService({
  readDataMode,
  listUsage: (userId) => listCreditCardUsage.execute(userId),
});

export const loadCreditCardUsage = (userId: string) => listCreditCardUsage.execute(userId);
