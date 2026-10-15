import type { PeriodHistoryItem } from '@/modules/periods/domain/models/period-view';
import { PeriodHistoryRow } from './PeriodHistoryRow';

export function PeriodHistoryList({ periods }: { periods: PeriodHistoryItem[] }) {
  if (periods.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhum período encontrado.</p>;
  }

  return (
    <ul className="space-y-3">
      {periods.map((period) => (
        <li key={period.id}>
          <PeriodHistoryRow period={period} />
        </li>
      ))}
    </ul>
  );
}
