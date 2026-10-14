import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { PeriodEntryRow } from './PeriodEntryRow';

export function PeriodEntriesList({ entries }: { entries: LedgerEntry[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Lançamentos do período</CardTitle>
        <CardDescription>{entries.length} lançamentos</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum lançamento neste período.</p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <li key={`${entry.kind}-${entry.id}`}>
                <PeriodEntryRow entry={entry} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
