import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getReportData } from '@/modules/reports/presentation/queries/reportsQueries';
import { calculateReportMetrics } from '@/lib/reports';
import { ReportsFilters } from './ReportsFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserPeriodsData } from '@/modules/periods/presentation/queries/periodQueries';

interface ReportsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await getSession();
  
  if (!session?.userId) {
    redirect('/login');
  }

  const periods = await getUserPeriodsData(session.userId);

  const resolvedParams = await searchParams;
  const periodIdParam = typeof resolvedParams.periodId === 'string' ? resolvedParams.periodId : undefined;
  const startDateParam = typeof resolvedParams.startDate === 'string' ? resolvedParams.startDate : undefined;
  const endDateParam = typeof resolvedParams.endDate === 'string' ? resolvedParams.endDate : undefined;
  const categoryParam = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;

  const startDate = startDateParam ? new Date(startDateParam + 'T00:00:00') : undefined;
  const endDate = endDateParam ? new Date(endDateParam + 'T23:59:59') : undefined;

  const data = await getReportData({
    userId: session.userId,
    periodId: periodIdParam,
    startDate,
    endDate,
    category: categoryParam,
  });

  const metrics = calculateReportMetrics(data.incomes, data.expenses, data.investments);

  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountInCents / 100);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white min-h-screen text-black">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>

      <ReportsFilters periods={periods} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalIncomes)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{formatPercentage(metrics.expensePercentage)} da receita</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalInvestments)}</div>
            <p className="text-xs text-muted-foreground">{formatPercentage(metrics.investmentPercentage)} da receita</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.balance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageExpense)}</div>
            <p className="text-xs text-muted-foreground">Por transação de gasto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.maxExpense)}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categoria Dominante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.dominantCategory || 'Nenhuma'}</div>
            {metrics.dominantCategory && (
               <p className="text-xs text-muted-foreground">Categoria com maior volume de gastos no período selecionado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
