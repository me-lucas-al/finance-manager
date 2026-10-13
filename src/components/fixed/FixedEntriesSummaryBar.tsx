'use client';

import { useAmountFormatter } from '@/hooks/useAmountFormatter';
import type { FixedEntriesSummary } from '@/modules/finance/domain/services/summarize-fixed-entries';

export function FixedEntriesSummaryBar({ summary }: { summary: FixedEntriesSummary }) {
  const formatAmount = useAmountFormatter();
  const progress = summary.totalCount === 0 ? 0 : Math.round((summary.launchedCount / summary.totalCount) * 100);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-zinc-500">Despesas fixas</p>
          <p className="text-sm font-semibold text-white">{formatAmount(summary.expenseTotal)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Receitas fixas</p>
          <p className="text-sm font-semibold text-emerald-400">{formatAmount(summary.incomeTotal)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Saldo projetado</p>
          <p className="text-sm font-semibold text-white">{formatAmount(summary.projectedBalance)}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Lançados {summary.launchedCount} de {summary.totalCount}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
