import type { LedgerEntry } from '../models/ledger-entry';
import type { LiveOverviewData } from '../models/financial-types';
import { entriesOfKind, monthlyEvolution, totalsOf } from './summarize-ledger';

const EVOLUTION_MONTHS = 6;

function groupInvestmentsByCategory(investments: LedgerEntry[]) {
  const groups = new Map<string, { count: number; amount: number }>();
  for (const investment of investments) {
    const current = groups.get(investment.category) ?? { count: 0, amount: 0 };
    groups.set(investment.category, { count: current.count + 1, amount: current.amount + investment.amount });
  }
  return Array.from(groups, ([name, group]) => ({ name, count: group.count, amount: group.amount }));
}

export function buildOverviewData(entries: LedgerEntry[], currentMonth: string): LiveOverviewData {
  const totals = totalsOf(entries);
  const investments = entriesOfKind(entries, 'investment');
  const activeCount = investments.filter((investment) => investment.amount > 0).length;
  const evolution = monthlyEvolution(entries, currentMonth, EVOLUTION_MONTHS);

  return {
    bankTotal: totals.balance,
    bankAccounts: [
      { id: 'primary', bank: 'manual', name: 'Saldo Disponível', countText: 'Principal', amount: totals.balance },
    ],
    cardTotal: 0,
    cardLimit: 0,
    cardUsedPercentage: 0,
    cards: [],
    investmentTotal: totals.investments,
    investmentCount: investments.length,
    activeInvestmentCount: activeCount,
    inactiveInvestmentCount: investments.length - activeCount,
    evolutionBalance: totals.balance,
    evolutionData: evolution.map((point) => ({ date: point.month, value: point.cumulativeBalance })),
    investmentInstitutions: groupInvestmentsByCategory(investments),
  };
}
