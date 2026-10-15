import { createAssetsDataService } from '@/modules/finance/application/services/assets-data-service';
import { createMovementsDataService } from '@/modules/finance/application/services/movements-data-service';
import { createOverviewDataService } from '@/modules/finance/application/services/overview-data-service';
import { listCreditCards } from './credit-cards';
import { loadLedger, loadPortfolio } from './finance-loaders';

const loadCardNames = async (userId: string) =>
  Object.fromEntries((await listCreditCards.execute(userId)).map((card) => [card.id, card.name]));

export const getLiveOverviewData = createOverviewDataService(loadLedger, loadPortfolio);
export const getLiveMovementsData = createMovementsDataService(loadLedger, loadCardNames);
export const getLiveInvestmentsData = createAssetsDataService(loadLedger, loadPortfolio);
