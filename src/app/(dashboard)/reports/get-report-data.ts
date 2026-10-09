import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userSettings, incomes, investments } from '@/db/schema';
import { getCurrentMonth, shiftMonth } from '@/lib/month';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { loadCategoryVsGoalData } from './category-vs-goal';
import { buildEvolutionTimeline, MonthSummary } from './report-timeline-builder';
import type { ReportFilterParams, ReportData } from './report-types';
import type { CategoryDatum } from './charts';

export * from './report-types';

export async function getReportData(userId: string, params: ReportFilterParams): Promise<ReportData> {
  const currentMonth = getCurrentMonth();
  const lastMonth = shiftMonth(currentMonth, -1);
  let period = params.period || currentMonth;
  if (period === 'current') period = currentMonth;
  if (period === 'last') period = lastMonth;

  const repo = new SupabaseTransactionRepository();
  const [allTxs, allIncomes, allInvs, [settings]] = await Promise.all([
    repo.findAllByUserId(userId),
    db.select().from(incomes).where(eq(incomes.userId, userId)),
    db.select().from(investments).where(eq(investments.userId, userId)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId)),
  ]);

  const filteredTxs = allTxs.filter((tx) => period === 'all' || tx.occurredAt.slice(0, 7) === period);
  const filteredIncomes = allIncomes.filter(
    (inc) => period === 'all' || inc.receivedAt.toISOString().slice(0, 7) === period
  );

  const totalIncome = filteredIncomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = filteredTxs.reduce((s, t) => s + Number(t.amount), 0);
  const totalInvestments = allInvs.reduce((s, i) => s + Number(i.amount), 0);
  const balance = totalIncome - totalExpenses;

  const catMap = new Map<string, number>();
  for (const tx of filteredTxs) {
    const c = tx.category || 'Outros';
    catMap.set(c, (catMap.get(c) ?? 0) + Number(tx.amount));
  }

  const categoryData: CategoryDatum[] = Array.from(catMap.entries())
    .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);

  const monthlyMap = new Map<string, MonthSummary>();
  for (const inc of allIncomes) {
    const m = inc.receivedAt.toISOString().slice(0, 7);
    const cur = monthlyMap.get(m) ?? { income: 0, expenses: 0 };
    cur.income += Number(inc.amount);
    monthlyMap.set(m, cur);
  }
  for (const tx of allTxs) {
    const m = tx.occurredAt.slice(0, 7);
    const cur = monthlyMap.get(m) ?? { income: 0, expenses: 0 };
    cur.expenses += Number(tx.amount);
    monthlyMap.set(m, cur);
  }

  const evolutionData = buildEvolutionTimeline(currentMonth, monthlyMap, totalInvestments);
  const categoryVsGoalData = await loadCategoryVsGoalData(userId);

  const expensePercentage = totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0;
  const investmentPercentage = totalIncome > 0 ? Math.round((totalInvestments / totalIncome) * 100) : 0;

  return {
    noDataMessage: filteredTxs.length === 0 && filteredIncomes.length === 0 ? 'Nenhuma transação encontrada.' : null,
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
    minInvestmentPercentage: settings?.minInvestmentPercentage ?? 20,
    categoryVsGoalData,
    selectedPeriod: period,
    selectedBank: params.bank || 'all',
  };
}
