import type { Portfolio } from '../../domain/models/portfolio';
import type { PortfolioSource } from '../../domain/ports/portfolio-source';

export class PortfolioService {
  constructor(private readonly source: PortfolioSource) {}

  async load(userId: string): Promise<Portfolio> {
    const [holdings, accounts, initialBalance] = await Promise.all([
      this.source.findHoldings(userId),
      this.source.findAccountBalances(userId),
      this.source.findInitialBalance(userId),
    ]);
    return { holdings, accounts, initialBalance };
  }
}
