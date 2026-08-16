import { connection } from 'next/server';
import { auth } from '@/auth';
import { db } from '../db';
import { expenses, incomes, investments } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateMetrics } from '../modules/finance/domain/financial-metrics';
import { ResolveCurrentPeriodUseCase } from '../modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '../modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '../modules/users/infrastructure/repositories';

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: 'No caminho certo',
  WARNING: 'Atenção',
  OFF_TRACK: 'Fora da meta',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ON_TRACK: 'default',
  WARNING: 'secondary',
  OFF_TRACK: 'destructive',
};

function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;
  const settingRepo = new DrizzleSettingRepository();

  const resolveCurrentPeriod = new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), settingRepo);
  const period = await resolveCurrentPeriod.execute(userId);

  const [userExpenses, userIncomes, userInvestments, settings] = await Promise.all([
    db.select().from(expenses).where(and(eq(expenses.userId, userId), eq(expenses.periodId, period.id))),
    db.select().from(incomes).where(and(eq(incomes.userId, userId), eq(incomes.periodId, period.id))),
    db.select().from(investments).where(and(eq(investments.userId, userId), eq(investments.periodId, period.id))),
    settingRepo.findByUserId(userId),
  ]);

  const maxExpensesPercentage = settings?.maxExpensesPercentage ?? 80;
  const minInvestmentPercentage = settings?.minInvestmentPercentage ?? 20;

  const metrics = calculateMetrics(
    userIncomes.map(i => Number(i.amount)),
    userExpenses.map(e => Number(e.amount)),
    userInvestments.map(i => Number(i.amount)),
    maxExpensesPercentage,
    minInvestmentPercentage
  );

  const availableForExpenses = Math.max(0, (metrics.totalIncome * (maxExpensesPercentage / 100)) - metrics.totalExpenses);
  const remainingForInvestment = Math.max(0, (metrics.totalIncome * (minInvestmentPercentage / 100)) - metrics.totalInvestments);

  await connection();
  const daysRemaining = daysUntil(period.endDate);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[metrics.status]}>{STATUS_LABEL[metrics.status]}</Badge>
          <span className="text-sm text-slate-500">{daysRemaining} dias restantes no período</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {metrics.totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {metrics.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-slate-500">
              {metrics.expensePercentage.toFixed(1)}% da receita (Máx: {maxExpensesPercentage}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {metrics.totalInvestments.toFixed(2)}</div>
            <p className="text-xs text-slate-500">
              {metrics.investmentPercentage.toFixed(1)}% da receita (Mín: {minInvestmentPercentage}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {metrics.balance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Limite de Gastos</CardTitle>
            <CardDescription>
              Disponível para gastar: R$ {availableForExpenses.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.expensePercentage} max={maxExpensesPercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meta de Investimento</CardTitle>
            <CardDescription>
              Falta investir: R$ {remainingForInvestment.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.investmentPercentage} max={minInvestmentPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
