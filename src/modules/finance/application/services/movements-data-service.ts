import type { LiveMovementsData } from '@/modules/finance/domain/models/financial-types';
import type { StatementFilters } from '../../domain/models/statement-filters';
import { buildMovementsData, type CardNames } from '../../domain/services/build-movements-data';
import type { LedgerLoader } from './data-loaders';

export type CardNamesLoader = (userId: string) => Promise<CardNames>;

const NO_CARD_NAMES: CardNamesLoader = async () => ({});

export function createMovementsDataService(loadLedger: LedgerLoader, loadCardNames: CardNamesLoader = NO_CARD_NAMES) {
  return async (userId: string, month: string, filters?: StatementFilters): Promise<LiveMovementsData> =>
    buildMovementsData(await loadLedger(userId), month, filters, await loadCardNames(userId));
}
