'use client';

import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';
import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
  grouped: Array<[string, LiveTransactionItem[]]>;
}

export function TransactionList({ grouped }: TransactionListProps) {
  if (grouped.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-zinc-500">
        Nenhuma transação encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {grouped.map(([date, transactions]) => (
        <div key={date} className="space-y-2.5">
          <h3 className="text-xs font-semibold text-zinc-400 select-none">{date}</h3>
          <div className="space-y-1.5">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
