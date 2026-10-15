import type { DataMode } from '@/modules/users/domain/models/user';
import type { CreditCardUsage } from '../../domain/models/credit-card';
import type { CreditCardOverview } from '../../domain/models/credit-card-overview';
import type { LiveOverviewData } from '../../domain/models/financial-types';
import { buildManualCardOverview } from '../../domain/services/build-manual-card-overview';

type PluggyCards = Pick<LiveOverviewData, 'cardTotal' | 'cardLimit' | 'cardUsedPercentage' | 'cards'>;

export type CreditCardOverviewDeps = {
  readDataMode: (userId: string) => Promise<DataMode | null>;
  listUsage: (userId: string) => Promise<CreditCardUsage[]>;
};

function toPluggyOverview(data: PluggyCards): CreditCardOverview {
  return {
    source: 'pluggy',
    total: data.cardTotal,
    limit: data.cardLimit,
    usedPercentage: data.cardUsedPercentage,
    cards: data.cards,
  };
}

export function createCreditCardOverviewService({ readDataMode, listUsage }: CreditCardOverviewDeps) {
  return async (userId: string, pluggyCards: PluggyCards): Promise<CreditCardOverview> => {
    if ((await readDataMode(userId)) !== 'manual') return toPluggyOverview(pluggyCards);
    return buildManualCardOverview(await listUsage(userId));
  };
}
