import { formatCurrency } from '@/lib/format';

export const CATEGORY_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#818cf8', '#38bdf8', '#4f46e5', '#93c5fd'];

export const AXIS_TICK = { fill: '#a1a1aa', fontSize: 11, fontFamily: 'inherit' };

export const TOOLTIP_STYLE = {
  backgroundColor: '#181920',
  borderColor: '#27272a',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
};

function firstValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

export function formatCurrencyTooltip(value: unknown): string {
  return formatCurrency(Number(firstValue(value) ?? 0));
}

export function formatPercentTooltip(value: unknown): string {
  return `${firstValue(value)}%`;
}

export function renderLegendLabel(value: string) {
  return <span style={{ color: '#d4d4d8', fontSize: '11px', fontFamily: 'inherit' }}>{value}</span>;
}
