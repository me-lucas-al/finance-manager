import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loadPeriods } from './load-periods';

const VISIBLE_PERIODS = 3;

export async function PastPeriodsCard({ userId }: { userId: string }) {
  const pastPeriods = (await loadPeriods(userId)).filter((period) => period.status === 'CLOSED');

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Histórico de Fechamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {pastPeriods.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum período fechado ainda.</p>
        )}
        <div className="space-y-3">
          {pastPeriods.slice(0, VISIBLE_PERIODS).map((period) => (
            <Link
              key={period.id}
              href={`/periods/${period.id}`}
              className="flex items-center justify-between p-3 bg-muted rounded border border-border transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-positive" />
                <span className="text-sm font-medium text-foreground">
                  {format(new Date(period.startDate), 'MMM yyyy', { locale: ptBR })}
                </span>
              </div>
              <Badge variant="secondary">Fechado</Badge>
            </Link>
          ))}
          {pastPeriods.length > VISIBLE_PERIODS && (
            <Link
              href="/periods/history"
              className="block rounded pt-2 text-center text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver todos os {pastPeriods.length} períodos
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
