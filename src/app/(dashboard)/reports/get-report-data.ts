import { getCurrentMonth } from '@/lib/month';
import { ledgerService } from '@/composition/finance';
import { goalRepository } from '@/composition/open-finance';
import { settingRepository } from '@/composition/users';
import { entriesInMonth, totalsByCategory, totalsOf } from '@/modules/finance/domain/services/summarize-ledger';
import { buildCategoryVsGoal, loadGoalTargets } from './category-vs-goal';
import { buildEvolutionTimeline } from './report-timeline-builder';
import { resolveReportPeriod } from './resolve-report-period';
import type { ReportFilterParams, ReportData } from './report-types';

export * from './report-types';

const TOP_CATEGORIES = 7;
const DEFAULT_MIN_INVESTMENT_PERCENTAGE = 20;

const percentOf = (part: number, whole: number): number => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export async function getReportData(userId: string, params: ReportFilterParams): Promise<ReportData> {
  const currentMonth = getCurrentMonth();
  const period = resolveReportPeriod(params.period, currentMonth);
  const isAllTime = period === 'all';
  const referenceMonth = isAllTime ? currentMonth : period;

  const [entries, settings, goals] = await Promise.all([
    ledgerService.load(userId),
    settingRepository.findByUserId(userId),
    loadGoalTargets(goalRepository, userId, referenceMonth),
  ]);

  const scoped = isAllTime ? entries : entriesInMonth(entries, period);
  const totals = totalsOf(scoped);
  const investmentPercentage = percentOf(totals.investments, totals.income);

  return {
    noDataMessage: scoped.length === 0 ? 'Nenhuma transação encontrada.' : null,
    metrics: {
      totalIncome: totals.income,
      totalExpenses: totals.expenses,
      totalInvestments: totals.investments,
      balance: totals.balance,
      expensePercentage: Math.min(100, percentOf(totals.expenses, totals.income)),
      investmentPercentage,
    },
    categoryData: totalsByCategory(scoped, 'expense').slice(0, TOP_CATEGORIES),
    evolutionData: buildEvolutionTimeline(entries, referenceMonth),
    currentInvestmentPercentage: investmentPercentage,
    minInvestmentPercentage: settings?.minInvestmentPercentage ?? DEFAULT_MIN_INVESTMENT_PERCENTAGE,
    categoryVsGoalData: buildCategoryVsGoal(entries, referenceMonth, goals),
    selectedPeriod: period,
  };
}
