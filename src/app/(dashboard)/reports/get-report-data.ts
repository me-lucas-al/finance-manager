import { fetchRawPluggyData } from '@/lib/pluggy-service';
import type { CategoryDatum, EvolutionDatum, CategoryGoalDatum } from './charts';

export type ReportFilterParams = {
  period?: string; // '2026-09', '2026-08', '2026-07', '2026-06', 'all', 'current', 'last'
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

const MONTH_LABELS: Record<string, string> = {
  '2026-09': 'Set/26',
  '2026-08': 'Ago/26',
  '2026-07': 'Jul/26',
  '2026-06': 'Jun/26',
  '2026-05': 'Mai/26',
  '2026-04': 'Abr/26',
  '2026-03': 'Mar/26',
  '2026-02': 'Fev/26',
  '2026-01': 'Jan/26',
  '2025-12': 'Dez/25',
  '2025-11': 'Nov/25',
  '2025-10': 'Out/25',
  '2025-09': 'Set/25',
  '2025-08': 'Ago/25',
};

export async function getReportData(
  userId: string,
  params: ReportFilterParams
): Promise<ReportData> {
  const { allTransactions, allInvestments } = await fetchRawPluggyData();

  // Normalize period filter
  let period = params.period || '2026-09';
  if (period === 'current') period = '2026-09';
  if (period === 'last') period = '2026-08';

  const bank = params.bank || 'all';

  // Filter transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    // 1. Bank filter
    if (bank !== 'all') {
      const acc = (tx.accountName || '').toLowerCase();
      if (bank === 'itau' && !acc.includes('itau') && !acc.includes('click')) return false;
      if (bank === 'nubank' && !acc.includes('nu') && !acc.includes('pagamentos')) return false;
      if (bank === 'inter' && !acc.includes('inter') && !acc.includes('gold')) return false;
    }

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

  let totalInvestments = 0;
  if (bank === 'all' || bank === 'itau') {
    totalInvestments = allInvestments.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);
  }

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
    if (bank !== 'all') {
      const acc = (tx.accountName || '').toLowerCase();
      if (bank === 'itau' && !acc.includes('itau') && !acc.includes('click')) continue;
      if (bank === 'nubank' && !acc.includes('nu') && !acc.includes('pagamentos')) continue;
      if (bank === 'inter' && !acc.includes('inter') && !acc.includes('gold')) continue;
    }

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

  // Last 6 consecutive months
  const timelineMonths = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  const evolutionData: EvolutionDatum[] = timelineMonths.map((ym) => {
    const agg = monthlyAggregates[ym] || { income: 0, expenses: 0 };
    const label = MONTH_LABELS[ym] || ym;
    return {
      label,
      income: Math.round(agg.income * 100) / 100,
      expenses: Math.round(agg.expenses * 100) / 100,
      investments: ym === '2026-09' ? totalInvestments : 0,
    };
  });

  // Category vs Goal data
  const defaultGoals: Record<string, number> = {
    Transfers: 2000,
    'Eating out': 1200,
    Groceries: 1500,
    School: 1000,
    Shopping: 800,
    'Gas stations': 900,
    Clothing: 700,
  };

  const categoryVsGoalData: CategoryGoalDatum[] = Object.entries(categoryMap)
    .slice(0, 6)
    .map(([category, actual]) => ({
      category,
      actual: Math.round(actual),
      target: defaultGoals[category] || Math.round(actual * 1.1),
    }));

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
    minInvestmentPercentage: 20,
    categoryVsGoalData,
    selectedPeriod: period,
    selectedBank: bank,
  };
}
