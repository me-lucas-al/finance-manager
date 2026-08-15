import { getSession } from '../../modules/auth/application/session';
import { db } from '../../db';
import { financialPeriods, userSettings } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getFinancialPeriod } from '../../modules/periods/domain/financial-period';

export default async function PeriodsPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;

  const [periods, settingsResult] = await Promise.all([
    db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId)).orderBy(desc(financialPeriods.startDate)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId))
  ]);
  const settings = settingsResult[0];

  const currentPeriod = periods.find((p) => p.status === 'OPEN' || p.status === 'CURRENT') || periods[0];
  const pastPeriods = periods.filter((p) => p.status === 'CLOSED');
  
  // Predict upcoming period using the same domain logic the closing job uses
  const nextReferenceDate = currentPeriod ? new Date(currentPeriod.endDate) : new Date();
  nextReferenceDate.setDate(nextReferenceDate.getDate() + 1);
  const { start: nextStartDate, end: nextEndDate } = getFinancialPeriod(
    nextReferenceDate,
    settings?.periodStartDay ?? 15,
    settings?.periodEndDay ?? 14
  );

  const today = new Date();
  const daysRemaining = currentPeriod ? differenceInDays(new Date(currentPeriod.endDate), today) : 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Calendário Financeiro</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Period */}
        <Card className="col-span-2 border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Período Atual
              </CardTitle>
              <Badge variant="default" className="bg-blue-600">Em Andamento</Badge>
            </div>
            <CardDescription>
              Acompanhe o andamento do seu ciclo financeiro atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentPeriod ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Início</p>
                    <p className="text-lg font-bold text-slate-900">
                      {format(new Date(currentPeriod.startDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-medium text-slate-500">Fim</p>
                    <p className="text-lg font-bold text-slate-900">
                      {format(new Date(currentPeriod.endDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500 font-medium">Progresso do Período</span>
                      <span className="text-blue-600 font-bold">{Math.max(0, daysRemaining)} dias restantes</span>
                    </div>
                    {/* Progress bar logic could be added here based on total days vs remaining days */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(0, (differenceInDays(today, new Date(currentPeriod.startDate)) / differenceInDays(new Date(currentPeriod.endDate), new Date(currentPeriod.startDate))) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Nenhum período atual encontrado.</p>
            )}
          </CardContent>
        </Card>

        {/* Configuration Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              Suas Regras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Dia de Início</span>
              <span className="font-bold text-slate-900">{settings?.periodStartDay || 15}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Dia de Fechamento</span>
              <span className="font-bold text-slate-900">{settings?.periodEndDay || 14}</span>
            </div>
            <div className="flex items-start gap-2 pt-2 text-sm text-slate-500">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p>O fechamento ocorre automaticamente no último dia do período.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Period */}
        <Card className="shadow-sm border-dashed border-slate-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Próximo Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-100">
              <span className="text-slate-600">
                {format(nextStartDate, "dd MMM", { locale: ptBR })} - {format(nextEndDate, "dd MMM", { locale: ptBR })}
              </span>
              <Badge variant="outline" className="text-slate-500 border-slate-200">Agendado</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Past Periods */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700">Histórico de Fechamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {pastPeriods.length > 0 ? (
              <div className="space-y-3">
                {pastPeriods.slice(0, 3).map((period) => (
                  <div key={period.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {format(new Date(period.startDate), "MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200">
                      Fechado
                    </Badge>
                  </div>
                ))}
                {pastPeriods.length > 3 && (
                  <p className="text-sm text-center text-blue-600 cursor-pointer hover:underline pt-2">
                    Ver todos os {pastPeriods.length} períodos
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum período fechado ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
