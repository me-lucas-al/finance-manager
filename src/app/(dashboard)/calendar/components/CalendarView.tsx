'use client';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react';

interface Period {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
}

interface CalendarViewProps {
  periods: Period[];
  activePeriod: Period | undefined;
  settings: {
    periodStartDay: number;
    periodEndDay: number;
  };
}

export function CalendarView({ periods, activePeriod, settings }: CalendarViewProps) {
  const now = new Date();
  
  let activePeriodStartDate: Date | null = null;
  let activePeriodEndDate: Date | null = null;
  let remainingDays = 0;
  let nextPeriodStartDate: Date | null = null;
  
  if (activePeriod) {
    activePeriodStartDate = new Date(activePeriod.startDate);
    activePeriodEndDate = new Date(activePeriod.endDate);
    remainingDays = Math.max(0, differenceInDays(activePeriodEndDate, now));
    nextPeriodStartDate = addDays(activePeriodEndDate, 1);
  }

  const pastPeriods = periods.filter(p => p.status === 'closed').sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  const activePeriodRange = activePeriodStartDate && activePeriodEndDate ? {
    from: activePeriodStartDate,
    to: activePeriodEndDate,
  } : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Visão do Período</CardTitle>
          <CardDescription>
            Dia de fechamento configurado: {settings.periodEndDay}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-around items-center gap-6">
          <Calendar
            mode="range"
            selected={activePeriodRange}
            locale={ptBR}
            className="rounded-md border shadow-sm"
          />

          <div className="flex flex-col space-y-6 w-full max-w-sm">
            {activePeriod ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Período Atual
                  </h3>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground bg-slate-50 p-4 rounded-lg border">
                    <div className="flex justify-between">
                      <span>Início:</span>
                      <span className="font-medium text-foreground">{format(activePeriodStartDate!, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fim:</span>
                      <span className="font-medium text-foreground">{format(activePeriodEndDate!, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Tempo Restante
                  </h3>
                  <div className="flex flex-col gap-1 text-sm bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-700 font-medium text-lg">{remainingDays} dias</span>
                      <span className="text-amber-600">para o fechamento</span>
                    </div>
                  </div>
                </div>
                {nextPeriodStartDate && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <h4 className="text-sm font-medium text-amber-800 mb-1">Próximo Período</h4>
                    <p className="text-xs text-amber-700">
                      Iniciará em: <span className="font-semibold">{format(nextPeriodStartDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 border border-dashed rounded-lg bg-slate-50">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Nenhum período ativo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crie ou abra um novo período financeiro para visualizá-lo aqui.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <CardDescription>
            Períodos anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastPeriods.length > 0 ? (
            <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
              {pastPeriods.map(period => (
                <div key={period.id} className="flex flex-col p-3 rounded-lg border bg-card hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {format(new Date(period.startDate), "MMM/yy", { locale: ptBR }).toUpperCase()}
                    </span>
                    <Badge variant="secondary" className="text-xs">Fechado</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{format(new Date(period.startDate), "dd/MM/yy")}</span>
                    <span>até</span>
                    <span>{format(new Date(period.endDate), "dd/MM/yy")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              Nenhum período passado encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
