import { ExpenseBreakdownCards } from '@/components/fluxo/ExpenseBreakdownCards';
import { TransactionsExplorer } from '@/components/fluxo/TransactionsExplorer';

export default async function MovementsPage() {
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

        {/* Top 2 Cards: Despesas & Despesas Futuras */}
        <ExpenseBreakdownCards />

        {/* Bottom Transactions Card */}
        <TransactionsExplorer />
      </div>
    </div>
  );
}
