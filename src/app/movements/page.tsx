import { getLiveMovementsData } from '@/lib/pluggy-service';
import { getCurrentMonth } from '@/lib/month';
import { ExpenseBreakdownCards } from '@/components/fluxo/ExpenseBreakdownCards';
import { TransactionsExplorer } from '@/components/fluxo/TransactionsExplorer';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatMonthLabel(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  return `${MONTH_NAMES[mon - 1]} De ${year}`;
}

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const defaultMonth = getCurrentMonth();
  const { month: rawMonth } = await searchParams;
  const month = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : defaultMonth;

  const data = await getLiveMovementsData(month);

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Fluxo de Caixa</h1>
          <p className="text-sm text-zinc-400">
            Despesas, receitas e movimentações das suas contas.
          </p>
        </div>

        {/* Top 2 Cards: Despesas & Despesas Futuras with Live Data */}
        <ExpenseBreakdownCards
          totalExpenses={data.totalExpenses}
          totalPending={data.totalPending}
          categorizedExpenses={data.categorizedExpenses}
          pendingExpenses={data.pendingExpenses}
        />

        {/* Bottom Transactions Card with Live Data */}
        <TransactionsExplorer
          month={month}
          monthLabel={formatMonthLabel(month)}
          initialTransactions={data.transactions}
          totalIncome={data.totalIncome}
          totalExpenses={data.totalExpenses}
          netBalance={data.netBalance}
        />
      </div>
    </div>
  );
}
