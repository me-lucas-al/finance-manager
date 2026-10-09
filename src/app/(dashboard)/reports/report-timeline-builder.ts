import { shiftMonth } from '@/lib/month';
import { formatMonthLabel } from './month-format';
import type { EvolutionDatum } from './charts';

export type MonthSummary = {
  income: number;
  expenses: number;
};

export function buildEvolutionTimeline(
  currentMonth: string,
  monthlyMap: Map<string, MonthSummary>,
  totalInvestments: number
): EvolutionDatum[] {
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(currentMonth, i - 5));

  return months.map((ym) => {
    const data = monthlyMap.get(ym) ?? { income: 0, expenses: 0 };
    return {
      label: formatMonthLabel(ym),
      income: data.income,
      expenses: data.expenses,
      investments: ym === currentMonth ? totalInvestments : 0,
    };
  });
}
