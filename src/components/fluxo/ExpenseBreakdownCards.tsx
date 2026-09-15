'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CreditCard, Clock, Info } from 'lucide-react';
import { usePrivacy } from '@/components/PrivacyProvider';

export function ExpenseBreakdownCards() {
  const { isPrivate } = usePrivacy();

  const formatAmount = (val: number) => {
    if (isPrivate) return 'R$ •••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const categorizedExpenses = [
    { name: 'Transfers', amount: 1877.22, percentage: 100, color: 'bg-blue-600' }, // dark blue per instruction
    { name: 'Eating out', amount: 1505.43, percentage: 80, color: 'bg-indigo-500' },
    { name: 'Groceries', amount: 1260.07, percentage: 67, color: 'bg-sky-500' },
    { name: 'School', amount: 940.9, percentage: 50, color: 'bg-purple-500' },
    { name: 'Shopping', amount: 885.76, percentage: 47, color: 'bg-cyan-500' },
    { name: 'Gas stations', amount: 808.29, percentage: 43, color: 'bg-amber-400' },
    { name: 'Clothing', amount: 801.89, percentage: 42, color: 'bg-emerald-500' },
    { name: 'Taxi and ride-hailing', amount: 730.11, percentage: 39, color: 'bg-teal-500' },
  ];

  const pendingExpenses = [
    { name: 'Transfers', amount: 541.51, percentage: 100, color: 'bg-violet-400' },
    { name: 'Shopping', amount: 325.8, percentage: 60, color: 'bg-blue-600' }, // dark blue per instruction
    { name: 'Eating out', amount: 316.98, percentage: 58, color: 'bg-sky-400' },
    { name: 'Groceries', amount: 269.39, percentage: 50, color: 'bg-cyan-400' },
    { name: 'Cinema, theater and concerts', amount: 114.75, percentage: 21, color: 'bg-yellow-400' },
    { name: 'Services', amount: 96.43, percentage: 18, color: 'bg-pink-400' },
  ];

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
              {formatAmount(12211.06)}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-0.5">Transações categorizadas</p>

          <div className="flex items-start gap-1.5 text-[11px] text-zinc-500 mt-2">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-500" />
            <span>
              Convertido para R$ pela cotação de 15/09/2026 · Fonte: Banco Central (PTAX) e ExchangeRate-API
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 space-y-4">
          {categorizedExpenses.map((cat) => (
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
          ))}
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
              {formatAmount(1960.0)}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-0.5">Transações pendentes</p>

          <div className="flex items-start gap-1.5 text-[11px] text-zinc-500 mt-2">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-500" />
            <span>
              Convertido para R$ pela cotação de 15/09/2026 · Fonte: Banco Central (PTAX) e ExchangeRate-API
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 space-y-4">
          {pendingExpenses.map((cat) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
