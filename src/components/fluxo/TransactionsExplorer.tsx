'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePrivacy } from '@/components/PrivacyProvider';
import { getCurrentMonth, shiftMonth } from '@/lib/month';
import type { LiveTransactionItem } from '@/lib/pluggy-service';

interface TransactionsExplorerProps {
  month: string;
  monthLabel: string;
  initialTransactions?: LiveTransactionItem[];
  totalIncome?: number;
  totalExpenses?: number;
}

export function TransactionsExplorer({
  month,
  monthLabel,
  initialTransactions = [],
  totalIncome = 0,
  totalExpenses = 0,
}: TransactionsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPrivate } = usePrivacy();
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const currentMonth = getCurrentMonth();
  const previousMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const isNextDisabled = nextMonth > currentMonth;

  function navigateToMonth(targetMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', targetMonth);
    router.push(`/movements?${params.toString()}`);
  }

  const transactionsList = initialTransactions;

  const formatAmount = (val: number, isPositive = false) => {
    if (isPrivate) return 'R$ •••••';
    const sign = isPositive && val > 0 ? '+' : '';
    const formatted = Math.abs(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const prefix = val < 0 ? 'R$ -' : 'R$ ';
    return `${sign}${prefix}${formatted}`;
  };

  const filteredTransactions = useMemo(() => {
    return transactionsList.filter((tx) => {
      if (filterType === 'income' && tx.type !== 'income') return false;
      if (filterType === 'expense' && tx.type !== 'expense') return false;
      if (selectedAccount !== 'all') {
        if (selectedAccount === 'itau' && tx.bank !== 'itau') return false;
        if (selectedAccount === 'nubank' && tx.bank !== 'nubank') return false;
        if (selectedAccount === 'inter' && tx.bank !== 'inter') return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          tx.description.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query) ||
          tx.account.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [transactionsList, search, selectedAccount, filterType]);

  // Compute calculated balance for filtered transactions
  const calculatedBalance = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + Math.abs(tx.amount) : acc - Math.abs(tx.amount);
    }, 0);
  }, [filteredTransactions]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, LiveTransactionItem[]>();
    for (const tx of filteredTransactions) {
      const list = map.get(tx.dateStr) || [];
      list.push(tx);
      map.set(tx.dateStr, list);
    }
    return Array.from(map.entries());
  }, [filteredTransactions]);

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-6 space-y-5">
        {/* Top Month Selector and Totals Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/60 pb-5">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToMonth(previousMonth)}
              aria-label="Mês anterior"
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-white px-2">
              {monthLabel}
            </span>
            <button
              onClick={() => navigateToMonth(nextMonth)}
              disabled={isNextDisabled}
              aria-label="Próximo mês"
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Income & Expense Totals */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
              <span>{formatAmount(totalIncome)}</span>
            </div>
            {/* Expense in DARK BLUE (replaced from red) */}
            <div className="flex items-center gap-1.5 text-blue-500">
              <ArrowUpRight className="h-4 w-4" />
              <span>{formatAmount(totalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Buscar transação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-zinc-900/60 border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus-visible:ring-blue-600 rounded-lg"
              />
            </div>

            {/* Account Selector */}
            <Select value={selectedAccount} onValueChange={(val) => setSelectedAccount(val ?? 'all')}>
              <SelectTrigger className="w-40 h-9 bg-zinc-900/60 border-zinc-800 text-xs text-zinc-300 rounded-lg">
                <SelectValue placeholder="Todas contas" />
              </SelectTrigger>
              <SelectContent className="bg-[#121318] border-zinc-800 text-xs text-zinc-200">
                <SelectItem value="all">Todas contas</SelectItem>
                <SelectItem value="itau">Itaú</SelectItem>
                <SelectItem value="nubank">Nubank</SelectItem>
                <SelectItem value="inter">Banco Inter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs: Todos | Entradas | Saídas (Dark Blue active pill per requirement) */}
          <div className="flex items-center p-1 rounded-lg bg-zinc-900/80 border border-zinc-800 self-end sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`text-xs px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`text-xs px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'income'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`text-xs px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'expense'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Saídas
            </button>
          </div>
        </div>

        {/* Grouped Transactions List */}
        <div className="space-y-6 pt-2">
          {grouped.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Nenhuma transação encontrada para os filtros selecionados.
            </div>
          ) : (
            grouped.map(([date, txs]) => (
              <div key={date} className="space-y-2.5">
                {/* Date Header */}
                <h3 className="text-xs font-semibold text-zinc-400 select-none">
                  {date}
                </h3>

                {/* List items for this date */}
                <div className="space-y-1.5">
                  {txs.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Transaction Icon Box */}
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
                              isExpense
                                ? 'bg-blue-950/40 border-blue-800/40 text-blue-400'
                                : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                            }`}
                          >
                            {isExpense ? (
                              <ArrowUpRight className="h-4 w-4 text-blue-400" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-zinc-100 leading-snug">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                              {tx.bank === 'itau' && (
                                <span className="h-3.5 px-1 bg-[#002f6c] text-white text-[9px] font-bold rounded flex items-center">
                                  itaú
                                </span>
                              )}
                              {tx.isCreditCard && (
                                <CreditCard className="h-3 w-3 text-zinc-400" />
                              )}
                              <span>{tx.account} · {tx.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount - DARK BLUE for expense (replaced from red) */}
                        <div className="text-right">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              isExpense ? 'text-blue-500' : 'text-emerald-400'
                            }`}
                          >
                            {formatAmount(tx.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 text-xs">
          <span className="text-zinc-500">{filteredTransactions.length} transações</span>
          <span className="text-zinc-400 font-semibold">
            Saldo: {formatAmount(calculatedBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
