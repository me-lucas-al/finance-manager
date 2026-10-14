import { getCurrentMonth } from '@/lib/month';
import type { LiveOverviewData } from '@/modules/finance/domain/models/financial-types';
import { buildOverviewData } from '../../domain/services/build-overview-data';
import { loadLedger } from './load-ledger';

export async function getLiveOverviewData(overrideUserId?: string): Promise<LiveOverviewData> {
  return buildOverviewData(await loadLedger(overrideUserId), getCurrentMonth());
}
