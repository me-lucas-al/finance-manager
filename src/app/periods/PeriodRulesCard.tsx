import { AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_END_DAY, DEFAULT_START_DAY, loadPeriodSettings } from './load-periods';

function RuleRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

export async function PeriodRulesCard({ userId }: { userId: string }) {
  const settings = await loadPeriodSettings(userId);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Suas Regras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RuleRow label="Dia de Início" value={settings?.periodStartDay || DEFAULT_START_DAY} />
        <RuleRow label="Dia de Fechamento" value={settings?.periodEndDay || DEFAULT_END_DAY} />
        <div className="flex items-start gap-2 pt-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p>O fechamento ocorre automaticamente no último dia do período.</p>
        </div>
      </CardContent>
    </Card>
  );
}
