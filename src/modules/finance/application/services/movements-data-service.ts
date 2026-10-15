import type { LiveMovementsData } from '@/modules/finance/domain/models/financial-types';
import type { StatementFilters } from '../../domain/models/statement-filters';
import { buildMovementsData } from '../../domain/services/build-movements-data';
import type { LedgerLoader } from './data-loaders';

export function createMovementsDataService(loadLedger: LedgerLoader) {
  return async (userId: string, month: string, filters?: StatementFilters): Promise<LiveMovementsData> =>
    buildMovementsData(await loadLedger(userId), month, filters);
}
