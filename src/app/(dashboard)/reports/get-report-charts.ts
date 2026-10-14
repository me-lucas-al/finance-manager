import { getCurrentMonth } from '@/lib/month';
import { goalRepository } from '@/composition/open-finance';
import { settingRepository } from '@/composition/users';
import { totalsByCategory } from '@/modules/finance/domain/services/summarize-ledger';
import { buildCategoryVsGoal, loadGoalTargets } from './category-vs-goal';
import { loadLedger } from './load-ledger';
import { buildEvolutionTimeline } from './report-timeline-builder';
import { ALL_PERIODS, entriesInPeriod, investmentPercentageOf } from './report-scope';
import type { ReportChartsProps } from './ReportCharts';

const TOP_CATEGORIES = 7;
const DEFAULT_MIN_INVESTMENT_PERCENTAGE = 20;

export async function getReportCharts(userId: string, period: string): Promise<ReportChartsProps> {
  const referenceMonth = period === ALL_PERIODS ? getCurrentMonth() : period;
  const entries = await loadLedger(userId);
  const settings = await settingRepository.findByUserId(userId);
  const goals = await loadGoalTargets(goalRepository, userId, referenceMonth);
  const scoped = entriesInPeriod(entries, period);

  return {
    categoryData: totalsByCategory(scoped, 'expense').slice(0, TOP_CATEGORIES),
    evolutionData: buildEvolutionTimeline(entries, referenceMonth),
    currentInvestmentPercentage: investmentPercentageOf(scoped),
    minInvestmentPercentage: settings?.minInvestmentPercentage ?? DEFAULT_MIN_INVESTMENT_PERCENTAGE,
    categoryVsGoalData: buildCategoryVsGoal(entries, referenceMonth, goals),
  };
}
