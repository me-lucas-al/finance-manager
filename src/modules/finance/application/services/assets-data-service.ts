import type { LiveInvestmentsData } from '@/modules/finance/domain/models/financial-types';
import { buildAssetsData } from '../../domain/services/build-assets-data';
import { loadLedger } from './load-ledger';

export async function getLiveInvestmentsData(overrideUserId?: string): Promise<LiveInvestmentsData> {
  return buildAssetsData(await loadLedger(overrideUserId));
}
