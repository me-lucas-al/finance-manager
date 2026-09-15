'use client';

import React from 'react';
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

// CVD-safe and dark-blue theme compliant colors (no red)
const CATEGORY_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#818cf8', '#38bdf8', '#4f46e5', '#93c5fd'];

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
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              stroke="#111216"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={formatCurrencyTooltip}
          contentStyle={{ backgroundColor: '#181920', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: '#d4d4d8', fontSize: '11px', fontFamily: 'inherit' }}>{value}</span>}
        />
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
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'inherit' }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          width={65}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={formatCurrencyTooltip}
          contentStyle={{ backgroundColor: '#181920', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#d4d4d8', fontSize: '11px', fontFamily: 'inherit' }}>{value}</span>}
        />
        <Bar dataKey="income" name="Receitas" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Despesas" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="investments" name="Investimentos" fill="#38bdf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InvestmentsVsTargetChart({ current, target }: { current: number; target: number }) {
  const data = [{ label: 'Taxa de Poupança', current: Math.round(current * 10) / 10, target: Math.round(target * 10) / 10 }];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
        <XAxis type="number" unit="%" tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'inherit' }} width={110} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={formatPercentTooltip}
          contentStyle={{ backgroundColor: '#181920', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#d4d4d8', fontSize: '11px', fontFamily: 'inherit' }}>{value}</span>}
        />
        <Bar dataKey="current" name="Realizado" fill="#2563eb" radius={[0, 4, 4, 0]} />
        <Bar dataKey="target" name="Meta Sugerida" fill="#38bdf8" radius={[0, 4, 4, 0]} />
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
    return <EmptyState message="Sem dados de categorias para o período selecionado." />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis dataKey="category" tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'inherit' }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
          width={65}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={formatCurrencyTooltip}
          contentStyle={{ backgroundColor: '#181920', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#d4d4d8', fontSize: '11px', fontFamily: 'inherit' }}>{value}</span>}
        />
        <Bar dataKey="actual" name="Gasto Real" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="target" name="Teto Estimado" fill="#38bdf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-xs text-zinc-500 font-sans">
      {message}
    </div>
  );
}
