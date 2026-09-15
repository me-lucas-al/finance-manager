import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { calculateMetrics } from '@/modules/finance/domain/financial-metrics';

export function SummaryCards({ metrics }: { metrics: ReturnType<typeof calculateMetrics> }) {
  return (
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
  );
}
