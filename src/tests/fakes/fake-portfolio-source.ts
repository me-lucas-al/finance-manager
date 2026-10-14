import type { AccountBalance, Holding } from '@/modules/finance/domain/models/portfolio';
import type { PortfolioSource } from '@/modules/finance/domain/ports/portfolio-source';

type FakePortfolio = { holdings?: Holding[]; accounts?: AccountBalance[]; initialBalance?: number };

export function fakePortfolioSource({ holdings = [], accounts = [], initialBalance = 0 }: FakePortfolio = {}): PortfolioSource {
  return {
    findHoldings: async () => holdings,
    findAccountBalances: async () => accounts,
    findInitialBalance: async () => initialBalance,
  };
}
