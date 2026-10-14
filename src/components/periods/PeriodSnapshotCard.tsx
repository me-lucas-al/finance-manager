import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PeriodSnapshotRecord } from '@/modules/periods/domain/models/period-records';

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: 'Dentro da meta',
  WARNING: 'Atenção',
  OFF_TRACK: 'Fora da meta',
};

const formatPercentage = (value: number): string => `${value.toFixed(1).replace('.', ',')}%`;

export function PeriodSnapshotCard({ snapshot }: { snapshot: PeriodSnapshotRecord }) {
  const rows = [
    { label: 'Situação no fechamento', value: STATUS_LABEL[snapshot.status] ?? snapshot.status },
    { label: 'Gasto sobre a receita', value: formatPercentage(snapshot.expensePercentage) },
    { label: 'Investido sobre a receita', value: formatPercentage(snapshot.investmentPercentage) },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Resumo do fechamento</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="space-y-1">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-base font-semibold text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
