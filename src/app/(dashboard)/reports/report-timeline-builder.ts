import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { monthlyEvolution } from '@/modules/finance/domain/services/summarize-ledger';
import { formatMonthLabel } from './month-format';
import type { EvolutionDatum } from './charts';

const TIMELINE_MONTHS = 6;

export function buildEvolutionTimeline(entries: LedgerEntry[], lastMonth: string): EvolutionDatum[] {
  return monthlyEvolution(entries, lastMonth, TIMELINE_MONTHS).map((point) => ({
    label: formatMonthLabel(point.month),
    income: point.income,
    expenses: point.expenses,
    investments: point.investments,
  }));
}
