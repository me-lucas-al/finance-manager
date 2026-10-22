import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { periodLedgerService } from '@/composition/finance';
import { formatCurrency } from '@/lib/format';
import { daysLeftInPeriod, wallDateString } from '@/modules/periods/domain/period-window';

const toBrazilianDate = (date: Date): string => wallDateString(date).split('-').reverse().join('/');

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="font-semibold text-white">{formatCurrency(value)}</span>
    </div>
  );
}

export async function PeriodSummaryCard({ userId }: { userId: string }) {
  const window = await periodLedgerService.currentWindow(userId);
  const totals = await periodLedgerService.totals(userId, window.id);
  const daysLeft = daysLeftInPeriod(window, new Date());

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Período atual</CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          {toBrazilianDate(window.startDate)} a {toBrazilianDate(window.endDate)} · faltam {daysLeft} dias
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Figure label="Entradas" value={totals.income} />
        <Figure label="Saídas" value={totals.expenses} />
        <Figure label="Investimentos" value={totals.investments} />
        <div className="border-t border-zinc-800 pt-3">
          <Figure label="Resultado" value={totals.balance} />
        </div>
      </CardContent>
    </Card>
  );
}
