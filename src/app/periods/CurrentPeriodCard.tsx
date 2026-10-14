import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findCurrentPeriod, loadPeriods } from './load-periods';
import { PeriodProgress } from './PeriodProgress';

const LONG_DATE_FORMAT = "dd 'de' MMMM, yyyy";

function DateBlock({ label, date, align }: { label: string; date: Date; align?: string }) {
  return (
    <div className={`space-y-1 ${align ?? ''}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{format(date, LONG_DATE_FORMAT, { locale: ptBR })}</p>
    </div>
  );
}

export async function CurrentPeriodCard({ userId }: { userId: string }) {
  const currentPeriod = findCurrentPeriod(await loadPeriods(userId));

  return (
    <Card className="col-span-1 md:col-span-2 border-l-4 border-l-primary shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Período Atual
          </CardTitle>
          <Badge variant="default">Em Andamento</Badge>
        </div>
        <CardDescription>Acompanhe o andamento do seu ciclo financeiro atual.</CardDescription>
      </CardHeader>
      <CardContent>
        {!currentPeriod && <p className="text-muted-foreground">Nenhum período atual encontrado.</p>}
        {currentPeriod && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <DateBlock label="Início" date={new Date(currentPeriod.startDate)} />
              <div className="w-px h-10 bg-border" />
              <DateBlock label="Fim" date={new Date(currentPeriod.endDate)} align="text-right" />
            </div>
            <PeriodProgress period={currentPeriod} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
