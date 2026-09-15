'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePrivacy } from '@/components/PrivacyProvider';

interface BalanceEvolutionChartProps {
  initialBalance?: number;
  data?: Array<{ date: string; value: number }>;
}

export function BalanceEvolutionChart({
  initialBalance = 0,
  data,
}: BalanceEvolutionChartProps) {
  const { isPrivate } = usePrivacy();
  const chartData = data ?? [];

  const formattedBalance = isPrivate ? 'R$ •••••' : `R$ ${initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="w-full">
      <div className="mb-4">
        <span className="text-3xl font-bold tracking-tight text-white">
          {formattedBalance}
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[220px] w-full mt-6 flex items-center justify-center text-xs text-zinc-500">
          Sem histórico suficiente para exibir a evolução do saldo.
        </div>
      ) : (
      <div className="h-[220px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  return (
                    <div className="rounded-lg border border-zinc-800 bg-[#121318] px-3 py-2 shadow-xl">
                      <p className="text-[11px] text-zinc-400">{payload[0].payload.date}</p>
                      <p className="text-sm font-semibold text-blue-400">
                        {isPrivate ? 'R$ •••••' : `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#balanceGradient)"
              dot={(props: { cx?: number; cy?: number; index?: number }) => {
                // Highlight final point
                if (props.index === chartData.length - 1 && props.cx && props.cy) {
                  return (
                    <circle
                      key="final-dot"
                      cx={props.cx}
                      cy={props.cy}
                      r={4.5}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                }
                return <g key={`dot-${props.index}`} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
