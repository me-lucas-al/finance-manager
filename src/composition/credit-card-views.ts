import { createCreditCardOverviewService } from '@/modules/finance/application/services/credit-card-overview-service';
import { createCardOptionsService } from '@/modules/finance/application/services/card-options-service';
import { listCreditCardUsage, listCreditCards } from './credit-cards';

export const getCreditCardOverview = createCreditCardOverviewService({
  listUsage: (userId) => listCreditCardUsage.execute(userId),
});

export const listCardOptions = createCardOptionsService({
  listCards: (userId) => listCreditCards.execute(userId),
});

export const loadCreditCardUsage = (userId: string) => listCreditCardUsage.execute(userId);
