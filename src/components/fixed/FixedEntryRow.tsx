import { useAmountFormatter } from '@/hooks/useAmountFormatter';
import type { FixedEntryView } from '@/modules/finance/domain/models/fixed-entry';
import { FixedEntryMenu, type FixedEntryMenuHandlers } from './FixedEntryMenu';
import { FixedEntryStatusBadge } from './FixedEntryStatusBadge';

type FixedEntryRowProps = FixedEntryMenuHandlers & { entry: FixedEntryView };

export function FixedEntryRow({ entry, ...handlers }: FixedEntryRowProps) {
  const formatAmount = useAmountFormatter();
  const amountClass = entry.kind === 'income' ? 'text-emerald-400' : 'text-zinc-100';
  const sign = entry.kind === 'income' ? 1 : -1;

  return (
    <li className="flex items-center justify-between gap-3 py-2.5 border-t border-zinc-800/50 first:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-8 shrink-0 text-center text-xs font-semibold text-zinc-400 tabular-nums">
          {entry.dueDate.slice(8, 10)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{entry.description}</p>
          <p className="truncate text-xs text-zinc-500">{entry.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <FixedEntryStatusBadge status={entry.status} />
        <span className={`text-sm font-semibold tabular-nums ${amountClass}`}>{formatAmount(sign * entry.amount)}</span>
        <FixedEntryMenu entry={entry} {...handlers} />
      </div>
    </li>
  );
}
