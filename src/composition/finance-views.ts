import { createAssetsDataService } from '@/modules/finance/application/services/assets-data-service';
import { createMovementsDataService } from '@/modules/finance/application/services/movements-data-service';
import { createOverviewDataService } from '@/modules/finance/application/services/overview-data-service';
import { loadLedger, loadPortfolio } from './finance-loaders';

export const getLiveOverviewData = createOverviewDataService(loadLedger, loadPortfolio);
export const getLiveMovementsData = createMovementsDataService(loadLedger);
export const getLiveInvestmentsData = createAssetsDataService(loadLedger, loadPortfolio);
