import type { CreditCardUsage } from '../../domain/models/credit-card';
import type { CreditCardOverview, CreditCardOverviews } from '../../domain/models/credit-card-overview';
import type { LiveOverviewData } from '../../domain/models/financial-types';
import { buildManualCardOverview } from '../../domain/services/build-manual-card-overview';

type PluggyCards = Pick<LiveOverviewData, 'cardTotal' | 'cardLimit' | 'cardUsedPercentage' | 'cards'>;

export type CreditCardOverviewDeps = {
  listUsage: (userId: string) => Promise<CreditCardUsage[]>;
};

function toPluggyOverview(data: PluggyCards): CreditCardOverview {
  return {
    total: data.cardTotal,
    limit: data.cardLimit,
    usedPercentage: data.cardUsedPercentage,
    cards: data.cards,
  };
}

export function createCreditCardOverviewService({ listUsage }: CreditCardOverviewDeps) {
  return async (userId: string, pluggyCards: PluggyCards): Promise<CreditCardOverviews> => ({
    connected: toPluggyOverview(pluggyCards),
    manual: buildManualCardOverview(await listUsage(userId)),
  });
}
