import { createCreditCardOverviewService } from '@/modules/finance/application/services/credit-card-overview-service';
import { createCardOptionsService } from '@/modules/finance/application/services/card-options-service';
import { listCreditCardUsage, listCreditCards } from './credit-cards';
import { dataModeStore } from './onboarding';

export const readDataMode = async (userId: string) => (await dataModeStore.getState(userId)).dataMode;

export const getCreditCardOverview = createCreditCardOverviewService({
  readDataMode,
  listUsage: (userId) => listCreditCardUsage.execute(userId),
});

export const listCardOptions = createCardOptionsService({
  readDataMode,
  listCards: (userId) => listCreditCards.execute(userId),
});

export const loadCreditCardUsage = (userId: string) => listCreditCardUsage.execute(userId);
