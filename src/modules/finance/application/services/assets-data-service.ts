import type { LiveInvestmentsData } from '@/modules/finance/domain/models/financial-types';
import { buildAssetsData } from '../../domain/services/build-assets-data';
import { loadLedger } from './load-ledger';
import { loadPortfolio } from './load-portfolio';

export async function getLiveInvestmentsData(overrideUserId?: string): Promise<LiveInvestmentsData> {
  const [entries, portfolio] = await Promise.all([loadLedger(overrideUserId), loadPortfolio(overrideUserId)]);
  return buildAssetsData(entries, portfolio);
}
