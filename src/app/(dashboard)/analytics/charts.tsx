'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

// Fixed categorical order, validated for CVD-safe adjacent separation (see dataviz skill).
const CATEGORY_COLORS = ['#3B82F6', '#22C55E', '#A78BFA', '#F59E0B', '#22D3EE', '#EF4444'];

function formatCurrencyTooltip(value: unknown) {
  const numeric = Array.isArray(value) ? value[0] : value;
  return formatCurrency(Number(numeric ?? 0));
}

function formatPercentTooltip(value: unknown) {
  const numeric = Array.isArray(value) ? value[0] : value;
  return `${numeric}%`;
}

export interface CategoryDatum {
  category: string;
  total: number;
}

export function ExpensesByCategoryChart({ data }: { data: CategoryDatum[] }) {
  if (data.length === 0) {
    return <EmptyState message="Nenhuma despesa registrada neste período." />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={formatCurrencyTooltip} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export interface EvolutionDatum {
  label: string;
  income: number;
  expenses: number;
  investments: number;
}

export function EvolutionChart({ data }: { data: EvolutionDatum[] }) {
  if (data.length === 0) {
    return <EmptyState message="Sem histórico suficiente para exibir a evolução." />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} width={90} />
        <Tooltip formatter={formatCurrencyTooltip} />
        <Legend />
        <Bar dataKey="income" name="Receitas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="investments" name="Investimentos" fill="#22C55E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InvestmentsVsTargetChart({ current, target }: { current: number; target: number }) {
  const data = [{ label: 'Investimentos', current: Math.round(current * 10) / 10, target: Math.round(target * 10) / 10 }];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
        <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={100} />
        <Tooltip formatter={formatPercentTooltip} />
        <Legend />
        <Bar dataKey="current" name="Atual" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        <Bar dataKey="target" name="Meta" fill="#22D3EE" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface CategoryGoalDatum {
  category: string;
  actual: number;
  target: number;
}

export function CategoryVsGoalChart({ data }: { data: CategoryGoalDatum[] }) {
  if (data.length === 0) {
    return <EmptyState message="Defina metas por categoria em /goals para comparar com o gasto real." />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} width={90} />
        <Tooltip formatter={formatCurrencyTooltip} />
        <Legend />
        <Bar dataKey="actual" name="Gasto" fill="#EF4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="target" name="Meta" fill="#22D3EE" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
