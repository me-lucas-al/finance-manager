import Link from 'next/link';
import { Amount } from '@/components/shared/Amount';
import { formatPeriodRange } from '@/modules/periods/domain/services/period-date';
import type { PeriodHistoryItem } from '@/modules/periods/domain/models/period-view';
import { PeriodStatusBadge } from './PeriodStatusBadge';
import { PERIOD_TOTAL_FIELDS } from './period-total-fields';

export function PeriodHistoryRow({ period }: { period: PeriodHistoryItem }) {
  return (
    <Link
      href={`/periods/${period.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">
          {formatPeriodRange(period.startDate, period.endDate)}
        </p>
        <PeriodStatusBadge closed={period.closed} />
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
        {PERIOD_TOTAL_FIELDS.map((field) => (
          <div key={field.key}>
            <dt className="text-muted-foreground">{field.label}</dt>
            <dd>
              <Amount value={period.totals[field.key]} className={`font-semibold tabular-nums ${field.className}`} />
            </dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}
