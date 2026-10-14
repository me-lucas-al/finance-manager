'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useAmountFormatter } from '@/hooks/useAmountFormatter';
import { getCurrentMonth, shiftMonth } from '@/lib/month';
import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';
import type { StatementFilters } from '@/modules/finance/domain/models/statement-filters';
import { signedAmount } from '@/modules/finance/domain/services/signed-amount';
import { ExplorerFilters } from './ExplorerFilters';
import { ExplorerHeader } from './ExplorerHeader';
import { TransactionList } from './TransactionList';
import { groupTransactionsByDate } from './group-transactions-by-date';
import { buildStatementPdfHref } from './statement-pdf-href';
import { useStatementFilters } from './useStatementFilters';

interface TransactionsExplorerProps {
  month: string;
  monthLabel: string;
  filters: StatementFilters;
  categoryOptions: string[];
  initialTransactions?: LiveTransactionItem[];
  totalIncome?: number;
  totalExpenses?: number;
  totalInvestments?: number;
}

export function TransactionsExplorer({
  month,
  monthLabel,
  filters,
  categoryOptions,
  initialTransactions = [],
  totalIncome = 0,
  totalExpenses = 0,
  totalInvestments = 0,
}: TransactionsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formatAmount = useAmountFormatter();
  const filterControls = useStatementFilters(filters);

  function navigateToMonth(targetMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', targetMonth);
    router.push(`/movements?${params.toString()}`);
  }

  const nextMonth = shiftMonth(month, 1);
  const balance = initialTransactions.reduce((sum, tx) => sum + signedAmount(tx.type, tx.amount), 0);

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <ExplorerHeader
          monthLabel={monthLabel}
          isNextDisabled={nextMonth > getCurrentMonth()}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          totalInvestments={totalInvestments}
          pdfHref={buildStatementPdfHref(month, filters)}
          onPrevious={() => navigateToMonth(shiftMonth(month, -1))}
          onNext={() => navigateToMonth(nextMonth)}
        />
        <ExplorerFilters
          search={filterControls.search}
          onSearchChange={filterControls.setSearch}
          category={filters.category}
          categoryOptions={categoryOptions}
          onCategoryChange={filterControls.setCategory}
          typeFilter={filters.type}
          onTypeChange={filterControls.setType}
        />
        <TransactionList grouped={groupTransactionsByDate(initialTransactions)} />
        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 text-xs">
          <span className="text-zinc-500">{initialTransactions.length} transações</span>
          <span className="text-zinc-400 font-semibold">Saldo: {formatAmount(balance)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
