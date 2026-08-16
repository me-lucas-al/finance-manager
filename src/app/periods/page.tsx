import { auth } from '@/auth';
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
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;

  const [periods, settingsResult] = await Promise.all([
    db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId)).orderBy(desc(financialPeriods.startDate)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId))
  ]);
  const settings = settingsResult[0];

  const currentPeriod = periods.find((p) => p.status === 'OPEN') || periods[0];
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
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Calendário Financeiro</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Period */}
        <Card className="col-span-1 md:col-span-2 border-l-4 border-l-primary shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Período Atual
              </CardTitle>
              <Badge variant="default">Em Andamento</Badge>
            </div>
            <CardDescription>
              Acompanhe o andamento do seu ciclo financeiro atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentPeriod ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Início</p>
                    <p className="text-lg font-bold text-foreground">
                      {format(new Date(currentPeriod.startDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-border"></div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-medium text-muted-foreground">Fim</p>
                    <p className="text-lg font-bold text-foreground">
                      {format(new Date(currentPeriod.endDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-medium">Progresso do Período</span>
                      <span className="text-primary font-bold">{Math.max(0, daysRemaining)} dias restantes</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, (differenceInDays(today, new Date(currentPeriod.startDate)) / differenceInDays(new Date(currentPeriod.endDate), new Date(currentPeriod.startDate))) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum período atual encontrado.</p>
            )}
          </CardContent>
        </Card>

        {/* Configuration Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Suas Regras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-muted-foreground">Dia de Início</span>
              <span className="font-bold text-foreground">{settings?.periodStartDay || 15}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-muted-foreground">Dia de Fechamento</span>
              <span className="font-bold text-foreground">{settings?.periodEndDay || 14}</span>
            </div>
            <div className="flex items-start gap-2 pt-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p>O fechamento ocorre automaticamente no último dia do período.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Period */}
        <Card className="shadow-sm border-dashed">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Próximo Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted rounded border border-border">
              <span className="text-muted-foreground">
                {format(nextStartDate, "dd MMM", { locale: ptBR })} - {format(nextEndDate, "dd MMM", { locale: ptBR })}
              </span>
              <Badge variant="outline">Agendado</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Past Periods */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Histórico de Fechamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {pastPeriods.length > 0 ? (
              <div className="space-y-3">
                {pastPeriods.slice(0, 3).map((period) => (
                  <div key={period.id} className="flex items-center justify-between p-3 bg-muted rounded border border-border">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-foreground">
                        {format(new Date(period.startDate), "MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      Fechado
                    </Badge>
                  </div>
                ))}
                {pastPeriods.length > 3 && (
                  <p className="text-sm text-center text-primary cursor-pointer hover:underline pt-2">
                    Ver todos os {pastPeriods.length} períodos
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum período fechado ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
