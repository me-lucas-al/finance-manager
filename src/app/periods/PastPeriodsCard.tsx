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
            <div
              key={period.id}
              className="flex items-center justify-between p-3 bg-muted rounded border border-border"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-positive" />
                <span className="text-sm font-medium text-foreground">
                  {format(new Date(period.startDate), 'MMM yyyy', { locale: ptBR })}
                </span>
              </div>
              <Badge variant="secondary">Fechado</Badge>
            </div>
          ))}
          {pastPeriods.length > VISIBLE_PERIODS && (
            <p className="text-sm text-center text-primary cursor-pointer hover:underline pt-2">
              Ver todos os {pastPeriods.length} períodos
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
