'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useAmountFormatter } from '@/hooks/useAmountFormatter';
import { getCurrentMonth, shiftMonth } from '@/lib/month';
import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';
import { ExplorerFilters } from './ExplorerFilters';
import { ExplorerHeader } from './ExplorerHeader';
import { TransactionList } from './TransactionList';
import { useTransactionFilters } from './useTransactionFilters';

interface TransactionsExplorerProps {
  month: string;
  monthLabel: string;
  initialTransactions?: LiveTransactionItem[];
  totalIncome?: number;
  totalExpenses?: number;
  totalInvestments?: number;
}

export function TransactionsExplorer({
  month,
  monthLabel,
  initialTransactions = [],
  totalIncome = 0,
  totalExpenses = 0,
  totalInvestments = 0,
}: TransactionsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formatAmount = useAmountFormatter();
  const filters = useTransactionFilters(initialTransactions);

  function navigateToMonth(targetMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', targetMonth);
    router.push(`/movements?${params.toString()}`);
  }

  const nextMonth = shiftMonth(month, 1);

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <ExplorerHeader
          monthLabel={monthLabel}
          isNextDisabled={nextMonth > getCurrentMonth()}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          totalInvestments={totalInvestments}
          onPrevious={() => navigateToMonth(shiftMonth(month, -1))}
          onNext={() => navigateToMonth(nextMonth)}
        />
        <ExplorerFilters
          search={filters.search}
          onSearchChange={filters.setSearch}
          selectedAccount={filters.selectedAccount}
          onAccountChange={filters.setSelectedAccount}
          typeFilter={filters.typeFilter}
          onTypeChange={filters.setTypeFilter}
        />
        <TransactionList grouped={filters.grouped} />
        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 text-xs">
          <span className="text-zinc-500">{filters.filtered.length} transações</span>
          <span className="text-zinc-400 font-semibold">Saldo: {formatAmount(filters.balance)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
