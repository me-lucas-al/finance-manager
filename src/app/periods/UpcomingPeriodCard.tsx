import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFinancialPeriod } from '@/modules/periods/domain/financial-period';
import { DEFAULT_END_DAY, DEFAULT_START_DAY, findCurrentPeriod, loadPeriods, loadPeriodSettings } from './load-periods';

const SHORT_DATE_FORMAT = 'dd MMM';

export async function UpcomingPeriodCard({ userId }: { userId: string }) {
  const periods = await loadPeriods(userId);
  const settings = await loadPeriodSettings(userId);
  const currentPeriod = findCurrentPeriod(periods);

  const nextReferenceDate = currentPeriod ? new Date(currentPeriod.endDate) : new Date();
  nextReferenceDate.setDate(nextReferenceDate.getDate() + 1);
  const { start, end } = getFinancialPeriod(
    nextReferenceDate,
    settings?.periodStartDay ?? DEFAULT_START_DAY,
    settings?.periodEndDay ?? DEFAULT_END_DAY,
  );

  return (
    <Card className="shadow-sm border-dashed">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Próximo Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 bg-muted rounded border border-border">
          <span className="text-muted-foreground">
            {format(start, SHORT_DATE_FORMAT, { locale: ptBR })} - {format(end, SHORT_DATE_FORMAT, { locale: ptBR })}
          </span>
          <Badge variant="outline">Agendado</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
