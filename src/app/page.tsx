import Link from 'next/link';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { db } from '../db';
import { incomes, investments } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Landmark, ArrowRight } from 'lucide-react';
import { calculateMetrics } from '../modules/finance/domain/financial-metrics';
import { ResolveCurrentPeriodUseCase } from '../modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '../modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '../modules/users/infrastructure/repositories';
import { SupabaseAlertLogRepository, SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { getExpenseBreakdown } from '@/modules/open-finance/application/shared/expense-totals';
import { groupAccountsByItem } from '@/components/connections/group-accounts';
import { CompactBankCard } from '@/components/connections/CompactBankCard';
import { formatCurrency } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: 'No caminho certo',
  WARNING: 'Atenção',
  OFF_TRACK: 'Fora da meta',
};

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'destructive'> = {
  ON_TRACK: 'default',
  WARNING: 'warning',
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

  const [expenseBreakdown, userIncomes, userInvestments, settings] = await Promise.all([
    getExpenseBreakdown(userId, period.startDate, period.endDate).catch(() => ({ total: 0, byCategory: {} })),
    db.select().from(incomes).where(and(eq(incomes.userId, userId), eq(incomes.periodId, period.id))),
    db.select().from(investments).where(and(eq(investments.userId, userId), eq(investments.periodId, period.id))),
    settingRepo.findByUserId(userId),
  ]);

  const maxExpensesPercentage = settings?.maxExpensesPercentage ?? 80;
  const minInvestmentPercentage = settings?.minInvestmentPercentage ?? 20;

  const metrics = calculateMetrics(
    userIncomes.map(i => Number(i.amount)),
    [expenseBreakdown.total],
    userInvestments.map(i => Number(i.amount)),
    maxExpensesPercentage,
    minInvestmentPercentage
  );

  const availableForExpenses = Math.max(0, (metrics.totalIncome * (maxExpensesPercentage / 100)) - metrics.totalExpenses);
  const remainingForInvestment = Math.max(0, (metrics.totalIncome * (minInvestmentPercentage / 100)) - metrics.totalInvestments);

  await connection();
  const daysRemaining = daysUntil(period.endDate);

  // The Supabase project (Open Finance data) may not be configured yet in this
  // environment — the dashboard degrades to an explicit empty state instead of
  // failing to render entirely.
  const monthlySummary = await new SupabaseAlertLogRepository()
    .findLatestByType('monthly_summary')
    .catch(() => null);

  const connectedAccounts = await new SupabaseAccountRepository().findAllByUserId(userId).catch(() => []);
  const bankConnections = groupAccountsByItem(connectedAccounts);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[metrics.status]}>{STATUS_LABEL[metrics.status]}</Badge>
          <span className="text-sm text-muted-foreground">{daysRemaining} dias restantes no período</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Landmark className="size-3.5 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Bancos Conectados</p>
          {bankConnections.length > 0 && (
            <Badge variant="outline" className="border-transparent bg-positive/10 text-positive">
              {bankConnections.length} ativa{bankConnections.length === 1 ? '' : 's'}
            </Badge>
          )}
        </div>
        {bankConnections.length === 0 ? (
          <Link
            href="/connections"
            className="flex items-center justify-between rounded-lg border border-dashed bg-card px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
          >
            Nenhum banco conectado ainda — conectar agora
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {bankConnections.map((connection) => (
              <CompactBankCard key={connection.pluggyItemId} connection={connection} />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do mês (IA)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySummary ? (
            <p className="text-sm text-foreground whitespace-pre-line">{monthlySummary.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ainda sem resumo gerado — ele aparece aqui depois que a análise diária rodar pela primeira vez.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(metrics.totalIncome)}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(metrics.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.expensePercentage.toFixed(1)}% da receita (Máx: {maxExpensesPercentage}%)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-positive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(metrics.totalInvestments)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.investmentPercentage.toFixed(1)}% da receita (Mín: {minInvestmentPercentage}%)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-foreground/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(metrics.balance)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Limite de Gastos</CardTitle>
            <CardDescription>
              Disponível para gastar: {formatCurrency(availableForExpenses)}
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
              Falta investir: {formatCurrency(remainingForInvestment)}
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
