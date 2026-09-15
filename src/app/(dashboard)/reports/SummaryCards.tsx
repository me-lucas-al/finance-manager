'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { ArrowUpRight, ArrowDownLeft, PiggyBank, Scale } from 'lucide-react';

interface SummaryCardsProps {
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    balance: number;
    expensePercentage: number;
    investmentPercentage: number;
  };
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Receita Total */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Receita Total
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold tracking-tight text-white font-sans">
            {formatCurrency(metrics.totalIncome)}
          </div>
          <p className="text-xs text-zinc-400 mt-1">Entradas no período</p>
        </CardContent>
      </Card>

      {/* Total Gasto */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm border-l-4 border-l-blue-600">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Gasto
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold tracking-tight text-white font-sans">
            {formatCurrency(metrics.totalExpenses)}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {metrics.expensePercentage.toFixed(0)}% da receita
          </p>
        </CardContent>
      </Card>

      {/* Total Investido */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm border-l-4 border-l-sky-600">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Investido
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-sky-400" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold tracking-tight text-white font-sans">
            {formatCurrency(metrics.totalInvestments)}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {metrics.investmentPercentage.toFixed(0)}% da receita
          </p>
        </CardContent>
      </Card>

      {/* Saldo Líquido */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm border-l-4 border-l-indigo-600">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Saldo Líquido
            </CardTitle>
            <Scale className="h-4 w-4 text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-2xl font-bold tracking-tight text-white font-sans">
            {formatCurrency(metrics.balance)}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {metrics.balance >= 0 ? 'Resultado positivo' : 'Déficit no período'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
