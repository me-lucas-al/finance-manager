import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';
import type { LedgerTotals } from '@/modules/finance/domain/services/summarize-ledger';
import { PERIOD_TOTAL_FIELDS } from './period-total-fields';

export function PeriodTotalsGrid({ totals }: { totals: LedgerTotals }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PERIOD_TOTAL_FIELDS.map((field) => (
        <Card key={field.key} className="shadow-sm">
          <CardHeader>
            <CardDescription>{field.label}</CardDescription>
            <CardTitle>
              <Amount value={totals[field.key]} className={`text-2xl tabular-nums ${field.className}`} />
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
