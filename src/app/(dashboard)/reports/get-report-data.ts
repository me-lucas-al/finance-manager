import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { fetchRawPluggyData } from '@/lib/pluggy-service';
import { getCurrentMonth, shiftMonth } from '@/lib/month';
import { sanitizeTransactions } from '@/lib/transaction-classifier';
import { loadCategoryVsGoalData } from './category-vs-goal';
import { formatMonthLabel } from './month-format';
import type { CategoryDatum, EvolutionDatum, CategoryGoalDatum } from './charts';

export type ReportFilterParams = {
  period?: string; // 'YYYY-MM', 'all', 'current', 'last'
  bank?: string;   // 'all', 'itau', 'nubank', 'inter'
};

export type ReportData = {
  noDataMessage: string | null;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    balance: number;
    expensePercentage: number;
    investmentPercentage: number;
  };
  categoryData: CategoryDatum[];
  evolutionData: EvolutionDatum[];
  currentInvestmentPercentage: number;
  minInvestmentPercentage: number;
  categoryVsGoalData: CategoryGoalDatum[];
  selectedPeriod: string;
  selectedBank: string;
};

export async function getReportData(
  userId: string,
  params: ReportFilterParams
): Promise<ReportData> {
  const { allTransactions, allInvestments } = await fetchRawPluggyData();

  const currentMonth = getCurrentMonth();
  const lastMonth = shiftMonth(currentMonth, -1);

  // Normalize period filter
  let period = params.period || currentMonth;
  if (period === 'current') period = currentMonth;
  if (period === 'last') period = lastMonth;

  const bank = params.bank || 'all';

  // Filter transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    // 1. Bank filter
    if (bank !== 'all' && tx.bank !== bank) return false;

    // 2. Period filter
    if (period !== 'all') {
      const txDateStr = tx.date instanceof Date ? tx.date.toISOString() : String(tx.date);
      const txMonth = txDateStr.slice(0, 7);
      if (txMonth !== period) return false;
    }

    return true;
  });

  // Calculate sanitized totals for the filtered selection
  const { summary: filteredSummary } = sanitizeTransactions(filteredTransactions);
  const totalIncome = filteredSummary.totalIncome;
  const totalExpenses = filteredSummary.totalExpenses;
  const categoryMap = filteredSummary.categoryTotals;

  const noDataMessage =
    filteredTransactions.length === 0
      ? 'Nenhuma transação encontrada para o período e banco selecionados.'
      : null;

  const totalInvestments = allInvestments
    .filter((inv) => bank === 'all' || inv.bank === bank)
    .reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);

  const balance = totalIncome - totalExpenses;
  const expensePercentage = totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0;
  const investmentPercentage = totalIncome > 0 ? Math.round((totalInvestments / totalIncome) * 100) : 0;

  // Category breakdown for pie chart
  const categoryData: CategoryDatum[] = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);

  // Evolution chart across months with sanitization applied per month
  const monthlyTransactionsMap: Record<string, typeof allTransactions> = {};
  for (const tx of allTransactions) {
    if (bank !== 'all' && tx.bank !== bank) continue;

    const txDateStr = tx.date instanceof Date ? tx.date.toISOString() : String(tx.date);
    const m = txDateStr.slice(0, 7);
    if (!monthlyTransactionsMap[m]) {
      monthlyTransactionsMap[m] = [];
    }
    monthlyTransactionsMap[m].push(tx);
  }

  // Last 6 consecutive months ending on the current real month
  const timelineMonths = Array.from({ length: 6 }, (_, i) => shiftMonth(currentMonth, i - 5));
  const evolutionData: EvolutionDatum[] = timelineMonths.map((ym) => {
    const txs = monthlyTransactionsMap[ym] || [];
    const { summary } = sanitizeTransactions(txs);
    return {
      label: formatMonthLabel(ym),
      income: summary.totalIncome,
      expenses: summary.totalExpenses,
      investments: ym === currentMonth ? totalInvestments : 0,
    };
  });

  const categoryVsGoalData = await loadCategoryVsGoalData(userId);

  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
  const minInvestmentPercentage = settings?.minInvestmentPercentage ?? 20;

  return {
    noDataMessage,
    metrics: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalInvestments: Math.round(totalInvestments * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      expensePercentage,
      investmentPercentage,
    },
    categoryData,
    evolutionData,
    currentInvestmentPercentage: investmentPercentage,
    minInvestmentPercentage,
    categoryVsGoalData,
    selectedPeriod: period,
    selectedBank: bank,
  };
}
