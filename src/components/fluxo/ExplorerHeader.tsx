'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAmountFormatter } from '@/hooks/useAmountFormatter';
import { ENTRY_KIND_STYLE } from './entry-kind-style';

interface ExplorerHeaderProps {
  monthLabel: string;
  isNextDisabled: boolean;
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  onPrevious: () => void;
  onNext: () => void;
}

const navButtonClass =
  'p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors';

export function ExplorerHeader(props: ExplorerHeaderProps) {
  const formatAmount = useAmountFormatter();
  const totals = [
    { kind: 'income' as const, value: props.totalIncome },
    { kind: 'expense' as const, value: props.totalExpenses },
    { kind: 'investment' as const, value: props.totalInvestments },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/60 pb-5">
      <div className="flex items-center gap-2">
        <button onClick={props.onPrevious} aria-label="Mês anterior" className={navButtonClass}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-white px-2">{props.monthLabel}</span>
        <button onClick={props.onNext} disabled={props.isNextDisabled} aria-label="Próximo mês" className={navButtonClass}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-4 text-xs font-semibold">
        {totals.map(({ kind, value }) => {
          const { Icon, amountClass, label } = ENTRY_KIND_STYLE[kind];
          return (
            <div key={kind} title={label} className={`flex items-center gap-1.5 ${amountClass}`}>
              <Icon className="h-4 w-4" />
              <span>{formatAmount(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
