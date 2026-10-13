import { CreditCard } from 'lucide-react';
import { EntryActionsMenu } from '@/components/entries/EntryActionsMenu';
import { Amount } from '@/components/shared/Amount';
import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';
import { ENTRY_KIND_STYLE, signedAmount } from './entry-kind-style';
import { toEditableEntry } from './to-editable-entry';

export function TransactionRow({ transaction }: { transaction: LiveTransactionItem }) {
  const { Icon, boxClass, iconClass, amountClass } = ENTRY_KIND_STYLE[transaction.type];

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/40 transition-colors group">
      <div className="flex items-center gap-3.5">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${boxClass}`}>
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-white group-hover:text-zinc-100 leading-snug">
            {transaction.description}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
            {transaction.isCreditCard && <CreditCard className="h-3 w-3 text-zinc-400" />}
            <span>{transaction.account} · {transaction.category}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Amount
          value={signedAmount(transaction.type, transaction.amount)}
          className={`text-sm font-semibold tabular-nums ${amountClass}`}
        />
        <EntryActionsMenu entry={toEditableEntry(transaction)} />
      </div>
    </div>
  );
}
