import type { FixedEntryView } from '../models/fixed-entry';

export type FixedEntriesSummary = {
  expenseTotal: number;
  incomeTotal: number;
  launchedCount: number;
  totalCount: number;
  scheduledExpense: number;
  scheduledIncome: number;
  projectedBalance: number;
};

const roundCents = (value: number): number => Math.round(value * 100) / 100;

function sumAmounts(views: FixedEntryView[]): number {
  return views.reduce((sum, view) => sum + view.amount, 0);
}

export function summarizeFixedEntries(views: FixedEntryView[], balance: number): FixedEntriesSummary {
  const counted = views.filter((view) => view.status === 'launched' || view.status === 'scheduled');
  const scheduled = counted.filter((view) => view.status === 'scheduled');
  const ofKind = (list: FixedEntryView[], kind: FixedEntryView['kind']) => list.filter((view) => view.kind === kind);
  const scheduledExpense = sumAmounts(ofKind(scheduled, 'expense'));
  const scheduledIncome = sumAmounts(ofKind(scheduled, 'income'));

  return {
    expenseTotal: roundCents(sumAmounts(ofKind(counted, 'expense'))),
    incomeTotal: roundCents(sumAmounts(ofKind(counted, 'income'))),
    launchedCount: counted.length - scheduled.length,
    totalCount: counted.length,
    scheduledExpense: roundCents(scheduledExpense),
    scheduledIncome: roundCents(scheduledIncome),
    projectedBalance: roundCents(balance + scheduledIncome - scheduledExpense),
  };
}
