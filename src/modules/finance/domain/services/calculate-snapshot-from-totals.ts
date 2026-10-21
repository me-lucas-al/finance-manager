import type { Goal } from '@/modules/open-finance/domain/repositories/goal-repository';
import type { FinancialSnapshot } from '../models/financial-snapshot';
import { EMPTY_PORTFOLIO, type Portfolio } from '../models/portfolio';
import type { SnapshotAggregates } from '../models/snapshot-aggregates';
import { buildCategoryMetrics } from './build-category-metrics';
import { bankBalanceFromTotals, investedTotalFromTotals } from './portfolio-totals';
import type { CategoryTotal } from './summarize-ledger';

export type SnapshotFromTotalsInput = {
  aggregates: SnapshotAggregates;
  goals: Goal[];
  portfolio?: Portfolio;
};

const SAVINGS_RATE_PERCENT = 100;
const PERIODS_IN_AVERAGE = 3;

const roundCents = (value: number): number => Math.round(value * 100) / 100;

const categoryMap = (totals: CategoryTotal[]): Record<string, number> =>
  Object.fromEntries(totals.map(({ category, total }) => [category, total]));

export function calculateSnapshotFromTotals(input: SnapshotFromTotalsInput): FinancialSnapshot {
  const { aggregates, goals } = input;
  const portfolio = input.portfolio ?? EMPTY_PORTFOLIO;
  const { current, previous, twoAgo } = aggregates;
  const currentCategories = categoryMap(aggregates.currentCategories);
  const savingsRate = current.income > 0 ? Math.round(((current.income - current.expenses) / current.income) * SAVINGS_RATE_PERCENT) : 0;
  const averageExpenses = (current.expenses + previous.expenses + twoAgo.expenses) / PERIODS_IN_AVERAGE;

  return {
    balance: bankBalanceFromTotals(aggregates.allTime, portfolio),
    currentMonth: {
      totalIncome: current.income,
      totalExpenses: current.expenses,
      totalInvestments: current.investments,
      netBalance: current.balance,
      savingsRate,
      categories: currentCategories,
    },
    previousMonth: { totalIncome: previous.income, totalExpenses: previous.expenses, netBalance: previous.balance },
    threeMonthsAverageExpenses: roundCents(averageExpenses),
    totalInvested: investedTotalFromTotals(aggregates.allTime, portfolio),
    categoryMetrics: buildCategoryMetrics(currentCategories, categoryMap(aggregates.previousCategories), goals),
  };
}
