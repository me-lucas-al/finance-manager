import { Amount } from '@/components/shared/Amount';
import { ENTRY_KIND_STYLE, signedAmount } from '@/components/fluxo/entry-kind-style';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { formatIsoDate } from '@/modules/periods/domain/services/period-date';

export function PeriodEntryRow({ entry }: { entry: LedgerEntry }) {
  const { Icon, boxClass, iconClass, amountClass } = ENTRY_KIND_STYLE[entry.kind];

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl p-3">
      <div className="flex items-center gap-3.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${boxClass}`}>
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
        <div>
          <p className="text-sm font-medium leading-snug text-foreground">{entry.description}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatIsoDate(entry.date)} · {entry.category}
          </p>
        </div>
      </div>
      <Amount
        value={signedAmount(entry.kind, entry.amount)}
        className={`text-sm font-semibold tabular-nums ${amountClass}`}
      />
    </div>
  );
}
