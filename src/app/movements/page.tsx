import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { getLiveMovementsData } from '@/composition/finance-views';
import { getCurrentMonth, isValidMonthKey, monthLabel } from '@/lib/month';
import { parseStatementFilters, type RawParams } from '@/modules/finance/domain/services/statement-filter-params';
import { ExpenseBreakdownCards } from '@/components/fluxo/ExpenseBreakdownCards';
import { TransactionsExplorer } from '@/components/fluxo/TransactionsExplorer';

export default async function MovementsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const params = await searchParams;
  const rawMonth = typeof params.month === 'string' ? params.month : undefined;
  const month = rawMonth && isValidMonthKey(rawMonth) ? rawMonth : getCurrentMonth();
  const filters = parseStatementFilters(params);

  const data = await getLiveMovementsData(await requireUserId(), month, filters);

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Fluxo de Caixa</h1>
          <p className="text-sm text-zinc-400">
            Despesas, receitas e movimentações das suas contas.
          </p>
        </div>

        <ExpenseBreakdownCards
          totalExpenses={data.totalExpenses}
          totalPending={data.totalPending}
          categorizedExpenses={data.categorizedExpenses}
          pendingExpenses={data.pendingExpenses}
        />

        <TransactionsExplorer
          month={month}
          monthLabel={monthLabel(month)}
          filters={filters}
          categoryOptions={data.categoryOptions}
          initialTransactions={data.transactions}
          totalIncome={data.totalIncome}
          totalExpenses={data.totalExpenses}
          totalInvestments={data.totalInvestments}
        />
      </div>
    </div>
  );
}
