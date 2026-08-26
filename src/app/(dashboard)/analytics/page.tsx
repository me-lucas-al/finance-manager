import { and, desc, eq, sum } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, incomes, investments, periodSnapshots, financialPeriods } from '@/db/schema';
import { auth } from '@/auth';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/repositories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SupabaseTransactionRepository,
  SupabaseGoalRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import {
  ExpensesByCategoryChart,
  EvolutionChart,
  InvestmentsVsTargetChart,
  CategoryVsGoalChart,
  type CategoryDatum,
  type EvolutionDatum,
  type CategoryGoalDatum,
} from './charts';

// The Supabase project (Open Finance data) may not be configured yet — this
// chart degrades to its own empty state instead of failing the whole page.
async function loadCategoryVsGoalData(userId: string): Promise<CategoryGoalDatum[]> {
  try {
    const now = new Date();
    const monthFilter = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [monthTransactions, goals] = await Promise.all([
      new SupabaseTransactionRepository().findAllByUserId(userId, { month: monthFilter }),
      new SupabaseGoalRepository().findAllByUserIdAndMonth(userId, `${monthFilter}-01`),
    ]);

    const spendByCategory = new Map<string, number>();
    for (const transaction of monthTransactions) {
      const category = transaction.category ?? transaction.categorySuggested ?? 'Sem categoria';
      spendByCategory.set(category, (spendByCategory.get(category) ?? 0) + Math.abs(transaction.amount));
    }

    const targetByCategory = new Map(
      goals.filter((goal) => goal.category !== null).map((goal) => [goal.category as string, goal.targetAmount]),
    );

    const categories = new Set([...spendByCategory.keys(), ...targetByCategory.keys()]);
    return Array.from(categories).map((category) => ({
      category,
      actual: spendByCategory.get(category) ?? 0,
      target: targetByCategory.get(category) ?? 0,
    }));
  } catch {
    return [];
  }
}

const HISTORY_SIZE = 6;

function periodLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Acesso negado</div>;
  }

  const userId = session.user.id;
  const settingRepo = new DrizzleSettingRepository();

  const resolveCurrentPeriod = new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), settingRepo);
  const currentPeriod = await resolveCurrentPeriod.execute(userId);

  const [expensesByCategory, currentIncome, currentInvestments, settings, pastSnapshots] = await Promise.all([
    db.select({ category: expenses.category, total: sum(expenses.amount) })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.periodId, currentPeriod.id)))
      .groupBy(expenses.category),
    db.select({ total: sum(incomes.amount) })
      .from(incomes)
      .where(and(eq(incomes.userId, userId), eq(incomes.periodId, currentPeriod.id))),
    db.select({ total: sum(investments.amount) })
      .from(investments)
      .where(and(eq(investments.userId, userId), eq(investments.periodId, currentPeriod.id))),
    settingRepo.findByUserId(userId),
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
  ]);

  const categoryData: CategoryDatum[] = expensesByCategory
    .map((row) => ({ category: row.category, total: Number(row.total ?? 0) }))
    .filter((row) => row.total > 0);

  const currentTotalExpenses = categoryData.reduce((acc, row) => acc + row.total, 0);
  const currentTotalIncome = Number(currentIncome[0]?.total ?? 0);
  const currentTotalInvestments = Number(currentInvestments[0]?.total ?? 0);

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

  const minInvestmentPercentage = settings?.minInvestmentPercentage ?? 20;
  const currentInvestmentPercentage = currentTotalIncome > 0 ? (currentTotalInvestments / currentTotalIncome) * 100 : 0;

  const categoryVsGoalData = await loadCategoryVsGoalData(userId);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Análises</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesByCategoryChart data={categoryData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Evolução (Receitas vs Despesas vs Investimentos)</CardTitle>
          </CardHeader>
          <CardContent>
            <EvolutionChart data={evolutionData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Investimentos vs Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentsVsTargetChart current={currentInvestmentPercentage} target={minInvestmentPercentage} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Gasto vs Meta por Categoria (mês atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryVsGoalChart data={categoryVsGoalData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
