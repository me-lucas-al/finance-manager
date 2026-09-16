'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CreditCard, Clock } from 'lucide-react';
import { usePrivacy } from '@/components/PrivacyProvider';
import type { LiveExpenseCategory } from '@/lib/pluggy-service';

interface ExpenseBreakdownCardsProps {
  totalExpenses?: number;
  totalPending?: number;
  categorizedExpenses?: LiveExpenseCategory[];
  pendingExpenses?: LiveExpenseCategory[];
}

export function ExpenseBreakdownCards({
  totalExpenses = 0,
  totalPending = 0,
  categorizedExpenses = [],
  pendingExpenses = [],
}: ExpenseBreakdownCardsProps) {
  const { isPrivate } = usePrivacy();

  const formatAmount = (val: number) => {
    if (isPrivate) return 'R$ •••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const displayCategorized = categorizedExpenses;
  const displayPending = pendingExpenses;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. DESPESAS - DARK BLUE ACCENT (REPLACED FROM RED) */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
        <CardHeader className="pb-3 pt-6 px-6">
          <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span>DESPESAS</span>
          </div>

          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-blue-500">
              {formatAmount(totalExpenses)}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-0.5">Transações categorizadas</p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 space-y-4">
          {displayCategorized.length === 0 ? (
            <p className="text-xs text-zinc-500">Nenhuma despesa categorizada neste período.</p>
          ) : (
            displayCategorized.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium">{cat.name}</span>
                  <span className="text-zinc-300 font-medium">{formatAmount(cat.amount)}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. DESPESAS FUTURAS - AMBER ACCENT */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
        <CardHeader className="pb-3 pt-6 px-6">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>DESPESAS FUTURAS</span>
          </div>

          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-amber-400">
              {formatAmount(totalPending)}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-0.5">Transações pendentes</p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 space-y-4">
          {displayPending.length === 0 ? (
            <p className="text-xs text-zinc-500">Nenhuma despesa futura pendente.</p>
          ) : (
            displayPending.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium">{cat.name}</span>
                  <span className="text-zinc-300 font-medium">{formatAmount(cat.amount)}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
