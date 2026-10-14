'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { CategoryDatum } from '@/types/report';
import { ChartEmptyState } from './ChartEmptyState';
import { CATEGORY_COLORS, TOOLTIP_STYLE, formatCurrencyTooltip, renderLegendLabel } from './chart-theme';

export function ExpensesByCategoryChart({ data }: { data: CategoryDatum[] }) {
  if (data.length === 0) return <ChartEmptyState message="Nenhuma despesa registrada neste período." />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={3}>
          {data.map((entry, index) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              stroke="#111216"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip formatter={formatCurrencyTooltip} contentStyle={TOOLTIP_STYLE} />
        <Legend verticalAlign="bottom" height={36} formatter={renderLegendLabel} />
      </PieChart>
    </ResponsiveContainer>
  );
}
