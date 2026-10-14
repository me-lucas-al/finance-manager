'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { BalancePoint } from '@/types/overview';
import { BalanceTooltip } from './BalanceTooltip';

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

function buildDotRenderer(lastIndex: number) {
  return function renderDot({ cx, cy, index }: DotProps) {
    if (index !== lastIndex || !cx || !cy) return <g key={`dot-${index}`} />;
    return <circle key="final-dot" cx={cx} cy={cy} r={4.5} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />;
  };
}

export function BalanceAreaChart({ data }: { data: BalancePoint[] }) {
  return (
    <div className="h-[220px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.45} />
              <stop offset="50%" stopColor="#1e3a8a" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#09090b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 11 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis hide domain={['dataMin - 300', 'dataMax + 200']} />
          <Tooltip content={<BalanceTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#balanceGradient)"
            dot={buildDotRenderer(data.length - 1)}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
