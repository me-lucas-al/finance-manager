import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { getLiveMovementsData } from '@/composition/finance-views';
import { getCurrentMonth, isValidMonthKey, monthLabel } from '@/lib/month';
import { ExpenseBreakdownCards } from '@/components/fluxo/ExpenseBreakdownCards';
import { TransactionsExplorer } from '@/components/fluxo/TransactionsExplorer';

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: rawMonth } = await searchParams;
  const defaultMonth = getCurrentMonth();
  const month = rawMonth && isValidMonthKey(rawMonth) ? rawMonth : defaultMonth;

  const data = await getLiveMovementsData(await requireUserId(), month);

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
          initialTransactions={data.transactions}
          totalIncome={data.totalIncome}
          totalExpenses={data.totalExpenses}
          totalInvestments={data.totalInvestments}
        />
      </div>
    </div>
  );
}
