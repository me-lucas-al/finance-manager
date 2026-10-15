import { createCreditCardOverviewService } from '@/modules/finance/application/services/credit-card-overview-service';
import { listCreditCardUsage } from './credit-cards';
import { dataModeStore } from './onboarding';

export const getCreditCardOverview = createCreditCardOverviewService({
  readDataMode: async (userId) => (await dataModeStore.getState(userId)).dataMode,
  listUsage: (userId) => listCreditCardUsage.execute(userId),
});
