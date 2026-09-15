import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { incomes, investments, financialPeriods, periodSnapshots } from '@/db/schema';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/repositories';
import { calculateMetrics } from '@/modules/finance/domain/financial-metrics';
import { getExpenseBreakdown } from '@/modules/open-finance/application/shared/expense-totals';
import { loadCategoryVsGoalData } from './category-vs-goal';
import type { CategoryDatum, EvolutionDatum } from './charts';

export type Range = 'current' | 'last' | 'all';

const HISTORY_SIZE = 6;

function periodLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export type ReportData = {
  noDataMessage: string | null;
  metrics: ReturnType<typeof calculateMetrics>;
  categoryData: CategoryDatum[];
  evolutionData: EvolutionDatum[];
  currentInvestmentPercentage: number;
  minInvestmentPercentage: number;
  categoryVsGoalData: Awaited<ReturnType<typeof loadCategoryVsGoalData>>;
};

export async function getReportData(userId: string, range: Range): Promise<ReportData> {
  const settingRepo = new DrizzleSettingRepository();
  const settings = await settingRepo.findByUserId(userId);
  const maxExpensesPercentage = settings?.maxExpensesPercentage ?? 80;
  const minInvestmentPercentage = settings?.minInvestmentPercentage ?? 20;

  const resolveCurrentPeriod = new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), settingRepo);
  const currentPeriod = await resolveCurrentPeriod.execute(userId);

  let periodId: string | null = null;
  let rangeFrom: Date | undefined;
  let rangeTo: Date | undefined;
  let noDataMessage: string | null = null;

  if (range === 'current') {
    periodId = currentPeriod.id;
    rangeFrom = currentPeriod.startDate;
    rangeTo = currentPeriod.endDate;
  } else if (range === 'last') {
    const [lastClosed] = await db.select().from(financialPeriods)
      .where(and(eq(financialPeriods.userId, userId), eq(financialPeriods.status, 'CLOSED')))
      .orderBy(desc(financialPeriods.endDate))
      .limit(1);
    if (!lastClosed) {
      noDataMessage = 'Nenhum período fechado ainda.';
    } else {
      periodId = lastClosed.id;
      rangeFrom = lastClosed.startDate;
      rangeTo = lastClosed.endDate;
    }
  }

  const scopedIncomes = periodId
    ? db.select().from(incomes).where(and(eq(incomes.userId, userId), eq(incomes.periodId, periodId)))
    : db.select().from(incomes).where(eq(incomes.userId, userId));
  const scopedInvestments = periodId
    ? db.select().from(investments).where(and(eq(investments.userId, userId), eq(investments.periodId, periodId)))
    : db.select().from(investments).where(eq(investments.userId, userId));

  const [rangeIncomes, rangeInvestments, expenseBreakdown] = noDataMessage
    ? [[], [], { total: 0, byCategory: {} }]
    : await Promise.all([
        scopedIncomes,
        scopedInvestments,
        getExpenseBreakdown(userId, rangeFrom, rangeTo).catch(() => ({ total: 0, byCategory: {} })),
      ]);

  const metrics = calculateMetrics(
    rangeIncomes.map((i) => Number(i.amount)),
    [expenseBreakdown.total],
    rangeInvestments.map((i) => Number(i.amount)),
    maxExpensesPercentage,
    minInvestmentPercentage
  );

  const categoryData: CategoryDatum[] = Object.entries(expenseBreakdown.byCategory)
    .map(([category, total]) => ({ category, total }))
    .filter((row) => row.total > 0);

  const isCurrentRange = periodId === currentPeriod.id;

  const [currentIncomeRows, currentInvestmentRows, currentExpenseBreakdown] = isCurrentRange
    ? [rangeIncomes, rangeInvestments, expenseBreakdown]
    : await Promise.all([
        db.select().from(incomes).where(and(eq(incomes.userId, userId), eq(incomes.periodId, currentPeriod.id))),
        db.select().from(investments).where(and(eq(investments.userId, userId), eq(investments.periodId, currentPeriod.id))),
        getExpenseBreakdown(userId, currentPeriod.startDate, currentPeriod.endDate).catch(() => ({ total: 0, byCategory: {} })),
      ]);

  const [pastSnapshots, categoryVsGoalData] = await Promise.all([
    db.select({
      totalIncomes: periodSnapshots.totalIncomes,
      totalExpenses: periodSnapshots.totalExpenses,
      totalInvestments: periodSnapshots.totalInvestments,
      startDate: financialPeriods.startDate,
    })
      .from(periodSnapshots)
      .innerJoin(financialPeriods, eq(periodSnapshots.periodId, financialPeriods.id))
      .where(eq(periodSnapshots.userId, userId))
      .orderBy(desc(financialPeriods.startDate))
      .limit(HISTORY_SIZE - 1),
    loadCategoryVsGoalData(userId),
  ]);

  const currentTotalIncome = currentIncomeRows.reduce((acc, i) => acc + Number(i.amount), 0);
  const currentTotalInvestments = currentInvestmentRows.reduce((acc, i) => acc + Number(i.amount), 0);
  const currentTotalExpenses = currentExpenseBreakdown.total;

  const evolutionData: EvolutionDatum[] = [
    ...pastSnapshots
      .slice()
      .reverse()
      .map((snapshot) => ({
        label: periodLabel(new Date(snapshot.startDate)),
        income: Number(snapshot.totalIncomes),
        expenses: Number(snapshot.totalExpenses),
        investments: Number(snapshot.totalInvestments),
      })),
    {
      label: `${periodLabel(currentPeriod.startDate)} (atual)`,
      income: currentTotalIncome,
      expenses: currentTotalExpenses,
      investments: currentTotalInvestments,
    },
  ];

  const currentInvestmentPercentage = currentTotalIncome > 0 ? (currentTotalInvestments / currentTotalIncome) * 100 : 0;

  return {
    noDataMessage,
    metrics,
    categoryData,
    evolutionData,
    currentInvestmentPercentage,
    minInvestmentPercentage,
    categoryVsGoalData,
  };
}
