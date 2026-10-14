import { daysRemainingIn, progressPercentage } from './period-progress';
import type { PeriodRecord } from './load-periods';

export function PeriodProgress({ period }: { period: PeriodRecord }) {
  const today = new Date();

  return (
    <div className="flex items-center gap-4 pt-2">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground font-medium">Progresso do Período</span>
          <span className="text-primary font-bold">{daysRemainingIn(period, today)} dias restantes</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${progressPercentage(period, today)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
