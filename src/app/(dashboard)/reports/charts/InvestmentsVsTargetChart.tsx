'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AXIS_TICK, TOOLTIP_STYLE, formatPercentTooltip, renderLegendLabel } from './chart-theme';

const roundToTenth = (value: number): number => Math.round(value * 10) / 10;

export function InvestmentsVsTargetChart({ current, target }: { current: number; target: number }) {
  const data = [{ label: 'Taxa de Poupança', current: roundToTenth(current), target: roundToTenth(target) }];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
        <XAxis type="number" unit="%" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={AXIS_TICK} width={110} axisLine={false} tickLine={false} />
        <Tooltip formatter={formatPercentTooltip} contentStyle={TOOLTIP_STYLE} />
        <Legend formatter={renderLegendLabel} />
        <Bar dataKey="current" name="Realizado" fill="#2563eb" radius={[0, 4, 4, 0]} />
        <Bar dataKey="target" name="Meta Sugerida" fill="#38bdf8" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
