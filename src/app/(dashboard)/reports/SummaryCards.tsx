import { ArrowUpRight, ArrowDownLeft, PiggyBank, Scale } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { ReportMetrics } from '@/types/report';
import { MetricCard } from './MetricCard';

export function SummaryCards({ metrics }: { metrics: ReportMetrics }) {
  const balanceCaption =
    metrics.balance >= 0 ? 'Economia no período (Receitas - Gastos)' : 'Déficit no período';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Receita Total"
        icon={<ArrowUpRight className="h-4 w-4 text-blue-400" />}
        borderClass="border-l-blue-500"
        value={formatCurrency(metrics.totalIncome)}
        caption="Entradas no período"
      />
      <MetricCard
        title="Total Gasto"
        icon={<ArrowDownLeft className="h-4 w-4 text-blue-400" />}
        borderClass="border-l-blue-600"
        value={formatCurrency(metrics.totalExpenses)}
        caption={`${metrics.expensePercentage.toFixed(0)}% da receita`}
      />
      <MetricCard
        title="Total Investido"
        icon={<PiggyBank className="h-4 w-4 text-sky-400" />}
        borderClass="border-l-sky-600"
        value={formatCurrency(metrics.totalInvestments)}
        caption={`${metrics.investmentPercentage.toFixed(0)}% da receita`}
      />
      <MetricCard
        title="Resultado do Mês"
        icon={<Scale className="h-4 w-4 text-indigo-400" />}
        borderClass="border-l-indigo-600"
        value={formatCurrency(metrics.balance)}
        caption={balanceCaption}
      />
    </div>
  );
}
