import type { AccountBalance, Holding } from '../models/portfolio';

export interface PortfolioSource {
  findHoldings(userId: string): Promise<Holding[]>;
  findAccountBalances(userId: string): Promise<AccountBalance[]>;
  findInitialBalance(userId: string): Promise<number>;
}
