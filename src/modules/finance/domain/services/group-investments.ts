import type { LedgerEntry } from '../models/ledger-entry';
import type { Portfolio } from '../models/portfolio';

type InvestmentGroup = { name: string; count: number; amount: number };

export function groupInvestments(investments: LedgerEntry[], portfolio: Portfolio): InvestmentGroup[] {
  const groups = new Map<string, { count: number; amount: number }>();
  const add = (name: string, amount: number) => {
    const current = groups.get(name) ?? { count: 0, amount: 0 };
    groups.set(name, { count: current.count + 1, amount: current.amount + amount });
  };
  investments.forEach((investment) => add(investment.category, investment.amount));
  portfolio.holdings.forEach((holding) => add(holding.type, holding.balance));
  return Array.from(groups, ([name, group]) => ({ name, ...group }));
}
