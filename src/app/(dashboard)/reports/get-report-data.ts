import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { fetchRawPluggyData } from '@/lib/pluggy-service';
import { loadCategoryVsGoalData } from './category-vs-goal';
import { formatMonthLabel, getCurrentMonth, shiftMonth } from './month-format';
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

  // Calculate totals for the filtered selection
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryMap: Record<string, number> = {};

  for (const tx of filteredTransactions) {
    const amt = Number(tx.amount);
    const isCredit = tx.type === 'CREDIT' || amt > 0;
    if (isCredit) {
      totalIncome += Math.abs(amt);
    } else {
      const expenseVal = Math.abs(amt);
      totalExpenses += expenseVal;
      const cat = tx.category || 'Outros';
      categoryMap[cat] = (categoryMap[cat] || 0) + expenseVal;
    }
  }

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

  // Evolution chart across months
  const monthlyAggregates: Record<string, { income: number; expenses: number }> = {};
  for (const tx of allTransactions) {
    if (bank !== 'all' && tx.bank !== bank) continue;

    const txDateStr = tx.date instanceof Date ? tx.date.toISOString() : String(tx.date);
    const m = txDateStr.slice(0, 7);
    if (!monthlyAggregates[m]) {
      monthlyAggregates[m] = { income: 0, expenses: 0 };
    }
    const amt = Number(tx.amount);
    if (tx.type === 'CREDIT' || amt > 0) {
      monthlyAggregates[m].income += Math.abs(amt);
    } else {
      monthlyAggregates[m].expenses += Math.abs(amt);
    }
  }

  // Last 6 consecutive months ending on the current real month
  const timelineMonths = Array.from({ length: 6 }, (_, i) => shiftMonth(currentMonth, i - 5));
  const evolutionData: EvolutionDatum[] = timelineMonths.map((ym) => {
    const agg = monthlyAggregates[ym] || { income: 0, expenses: 0 };
    return {
      label: formatMonthLabel(ym),
      income: Math.round(agg.income * 100) / 100,
      expenses: Math.round(agg.expenses * 100) / 100,
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
