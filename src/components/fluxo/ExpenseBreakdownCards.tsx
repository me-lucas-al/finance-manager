import { CreditCard, Clock } from 'lucide-react';
import type { LiveExpenseCategory } from '@/modules/finance/domain/models/financial-types';
import { ExpenseCategoryCard } from './ExpenseCategoryCard';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <ExpenseCategoryCard
        title="DESPESAS"
        icon={<CreditCard className="h-4 w-4 text-blue-500" />}
        accentClass="text-blue-500"
        total={totalExpenses}
        subtitle="Transações categorizadas"
        emptyMessage="Nenhuma despesa categorizada neste período."
        categories={categorizedExpenses}
      />
      <ExpenseCategoryCard
        title="DESPESAS FUTURAS"
        icon={<Clock className="h-4 w-4 text-amber-400" />}
        accentClass="text-amber-400"
        total={totalPending}
        subtitle="Transações pendentes"
        emptyMessage="Nenhuma despesa futura pendente."
        categories={pendingExpenses}
      />
    </div>
  );
}
