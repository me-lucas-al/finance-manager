import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, incomes, investments, financialPeriods } from '@/db/schema';
import { auth } from '@/auth';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/repositories';
import { calculateMetrics } from '@/modules/finance/domain/financial-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportFilters } from './ReportFilters';
import { formatCurrency } from '@/lib/format';

type Range = 'current' | 'last' | 'all';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Acesso negado</div>;
  }
  const userId = session.user.id;

  const { range: rawRange } = await searchParams;
  const range: Range = rawRange === 'last' || rawRange === 'all' ? rawRange : 'current';

  const settingRepo = new DrizzleSettingRepository();
  const settings = await settingRepo.findByUserId(userId);
  const maxExpensesPercentage = settings?.maxExpensesPercentage ?? 80;
  const minInvestmentPercentage = settings?.minInvestmentPercentage ?? 20;

  let periodId: string | null = null;
  let noDataMessage: string | null = null;

  if (range === 'current') {
    const resolveCurrentPeriod = new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), settingRepo);
    const currentPeriod = await resolveCurrentPeriod.execute(userId);
    periodId = currentPeriod.id;
  } else if (range === 'last') {
    const [lastClosed] = await db.select().from(financialPeriods)
      .where(and(eq(financialPeriods.userId, userId), eq(financialPeriods.status, 'CLOSED')))
      .orderBy(desc(financialPeriods.endDate))
      .limit(1);
    if (!lastClosed) {
      noDataMessage = 'Nenhum período fechado ainda.';
    } else {
      periodId = lastClosed.id;
    }
  }

  const scopedIncomes = periodId
    ? db.select().from(incomes).where(and(eq(incomes.userId, userId), eq(incomes.periodId, periodId)))
    : db.select().from(incomes).where(eq(incomes.userId, userId));
  const scopedExpenses = periodId
    ? db.select().from(expenses).where(and(eq(expenses.userId, userId), eq(expenses.periodId, periodId)))
    : db.select().from(expenses).where(eq(expenses.userId, userId));
  const scopedInvestments = periodId
    ? db.select().from(investments).where(and(eq(investments.userId, userId), eq(investments.periodId, periodId)))
    : db.select().from(investments).where(eq(investments.userId, userId));

  const [rangeIncomes, rangeExpenses, rangeInvestments] = noDataMessage
    ? [[], [], []]
    : await Promise.all([scopedIncomes, scopedExpenses, scopedInvestments]);

  const metrics = calculateMetrics(
    rangeIncomes.map((i) => Number(i.amount)),
    rangeExpenses.map((e) => Number(e.amount)),
    rangeInvestments.map((i) => Number(i.amount)),
    maxExpensesPercentage,
    minInvestmentPercentage
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Relatórios</h2>
      </div>

      <ReportFilters range={range} />

      {noDataMessage ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">{noDataMessage}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold tabular-nums">{formatCurrency(metrics.totalIncome)}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold tabular-nums">{formatCurrency(metrics.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">{metrics.expensePercentage.toFixed(1)}% da receita</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-positive">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold tabular-nums">{formatCurrency(metrics.totalInvestments)}</div>
              <p className="text-xs text-muted-foreground mt-1">{metrics.investmentPercentage.toFixed(1)}% da receita</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-foreground/70">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold tabular-nums">{formatCurrency(metrics.balance)}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
