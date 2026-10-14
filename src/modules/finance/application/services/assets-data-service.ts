import type { LiveInvestmentsData } from '@/modules/finance/domain/models/financial-types';
import { buildAssetsData } from '../../domain/services/build-assets-data';
import type { LedgerLoader, PortfolioLoader } from './data-loaders';

export function createAssetsDataService(loadLedger: LedgerLoader, loadPortfolio: PortfolioLoader) {
  return async (userId: string): Promise<LiveInvestmentsData> => {
    const [entries, portfolio] = await Promise.all([loadLedger(userId), loadPortfolio(userId)]);
    return buildAssetsData(entries, portfolio);
  };
}
