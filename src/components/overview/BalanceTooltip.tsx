'use client';

import { useAmountFormatter } from '@/hooks/useAmountFormatter';

interface BalanceTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number; payload: { date: string } }>;
}

export function BalanceTooltip({ active, payload }: BalanceTooltipProps) {
  const formatAmount = useAmountFormatter();
  if (!active || !payload || payload.length === 0) return null;

  const [point] = payload;

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#121318] px-3 py-2 shadow-xl">
      <p className="text-[11px] text-zinc-400">{point.payload.date}</p>
      <p className="text-sm font-semibold text-blue-400">{formatAmount(point.value ?? 0)}</p>
    </div>
  );
}
