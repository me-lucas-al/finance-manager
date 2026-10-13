import { FinancialSnapshot, CategoryMetric } from '../models/financial-snapshot';
import type { LedgerEntry } from '../models/ledger-entry';
import { Goal } from '@/modules/open-finance/domain/repositories/goal-repository';
import { getCurrentMonth, shiftMonth } from '@/lib/month';
import { entriesInMonth, totalsByCategory, totalsOf } from './summarize-ledger';

export type SnapshotInput = {
  entries: LedgerEntry[];
  goals: Goal[];
  referenceMonth?: string;
};

const SAVINGS_RATE_PERCENT = 100;

function categoryMap(entries: LedgerEntry[]): Record<string, number> {
  return Object.fromEntries(totalsByCategory(entries, 'expense').map(({ category, total }) => [category, total]));
}

function buildCategoryMetrics(
  current: Record<string, number>,
  previous: Record<string, number>,
  goals: Goal[]
): CategoryMetric[] {
  return Array.from(new Set([...Object.keys(current), ...Object.keys(previous)])).map((category) => {
    const currentAmount = current[category] ?? 0;
    const previousAmount = previous[category] ?? 0;
    const goal = goals.find((item) => item.category?.toLowerCase() === category.toLowerCase());
    return {
      category,
      currentAmount,
      previousAmount,
      diffPercentage: previousAmount > 0 ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100) : 0,
      goalAmount: goal ? Number(goal.targetAmount) : undefined,
    };
  });
}

export function calculateFinancialSnapshot(input: SnapshotInput): FinancialSnapshot {
  const currentKey = input.referenceMonth ?? getCurrentMonth();
  const previousKey = shiftMonth(currentKey, -1);
  const twoMonthsAgoKey = shiftMonth(currentKey, -2);

  const currentEntries = entriesInMonth(input.entries, currentKey);
  const previousEntries = entriesInMonth(input.entries, previousKey);
  const current = totalsOf(currentEntries);
  const previous = totalsOf(previousEntries);
  const twoMonthsAgo = totalsOf(entriesInMonth(input.entries, twoMonthsAgoKey));
  const all = totalsOf(input.entries);

  const currentCategories = categoryMap(currentEntries);
  const savingsRate = current.income > 0 ? Math.round(((current.income - current.expenses) / current.income) * SAVINGS_RATE_PERCENT) : 0;
  const averageExpenses = (current.expenses + previous.expenses + twoMonthsAgo.expenses) / 3;

  return {
    balance: all.balance,
    currentMonth: {
      totalIncome: current.income,
      totalExpenses: current.expenses,
      totalInvestments: current.investments,
      netBalance: current.balance,
      savingsRate,
      categories: currentCategories,
    },
    previousMonth: {
      totalIncome: previous.income,
      totalExpenses: previous.expenses,
      netBalance: previous.balance,
    },
    threeMonthsAverageExpenses: Math.round(averageExpenses * 100) / 100,
    totalInvested: all.investments,
    categoryMetrics: buildCategoryMetrics(currentCategories, categoryMap(previousEntries), input.goals),
  };
}
