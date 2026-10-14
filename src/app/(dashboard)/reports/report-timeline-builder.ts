import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { monthlyEvolution } from '@/modules/finance/domain/services/summarize-ledger';
import { monthLabel } from '@/lib/month';
import type { EvolutionDatum } from '@/types/report';

const TIMELINE_MONTHS = 6;

export function buildEvolutionTimeline(entries: LedgerEntry[], lastMonth: string): EvolutionDatum[] {
  return monthlyEvolution(entries, lastMonth, TIMELINE_MONTHS).map((point) => ({
    label: monthLabel(point.month, 'short'),
    income: point.income,
    expenses: point.expenses,
    investments: point.investments,
  }));
}
