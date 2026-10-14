'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { CategoryGoalDatum } from '@/types/report';
import { ChartEmptyState } from './ChartEmptyState';
import { AXIS_TICK, TOOLTIP_STYLE, formatCurrencyTooltip, renderLegendLabel } from './chart-theme';

export function CategoryVsGoalChart({ data }: { data: CategoryGoalDatum[] }) {
  if (data.length === 0) return <ChartEmptyState message="Sem dados de categorias para o período selecionado." />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis dataKey="category" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis
          tick={AXIS_TICK}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
          width={65}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip formatter={formatCurrencyTooltip} contentStyle={TOOLTIP_STYLE} />
        <Legend formatter={renderLegendLabel} />
        <Bar dataKey="actual" name="Gasto Real" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="target" name="Teto Estimado" fill="#38bdf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
