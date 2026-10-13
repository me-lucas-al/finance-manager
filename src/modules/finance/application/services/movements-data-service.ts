import type { LiveMovementsData } from '@/modules/finance/domain/models/financial-types';
import { buildMovementsData } from '../../domain/services/build-movements-data';
import { loadLedger } from './load-ledger';

export async function getLiveMovementsData(month: string, overrideUserId?: string): Promise<LiveMovementsData> {
  return buildMovementsData(await loadLedger(overrideUserId), month);
}
