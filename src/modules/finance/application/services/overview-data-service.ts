import { getCurrentMonth } from '@/lib/month';
import type { LiveOverviewData } from '@/modules/finance/domain/models/financial-types';
import { buildOverviewData } from '../../domain/services/build-overview-data';
import { loadLedger } from './load-ledger';
import { loadPortfolio } from './load-portfolio';

export async function getLiveOverviewData(overrideUserId?: string): Promise<LiveOverviewData> {
  const [entries, portfolio] = await Promise.all([loadLedger(overrideUserId), loadPortfolio(overrideUserId)]);
  return buildOverviewData(entries, getCurrentMonth(), portfolio);
}
