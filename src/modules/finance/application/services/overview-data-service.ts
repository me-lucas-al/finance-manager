import { getCurrentMonth } from '@/lib/month';
import type { LiveOverviewData } from '@/modules/finance/domain/models/financial-types';
import { buildOverviewData } from '../../domain/services/build-overview-data';
import type { LedgerLoader, PortfolioLoader } from './data-loaders';

export function createOverviewDataService(loadLedger: LedgerLoader, loadPortfolio: PortfolioLoader) {
  return async (userId: string): Promise<LiveOverviewData> => {
    const [entries, portfolio] = await Promise.all([loadLedger(userId), loadPortfolio(userId)]);
    return buildOverviewData(entries, getCurrentMonth(), portfolio);
  };
}
