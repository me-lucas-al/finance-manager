import { totalsOf } from '@/modules/finance/domain/services/summarize-ledger';
import type { ReportMetrics } from '@/types/report';
import { loadLedger } from './load-ledger';
import { entriesInPeriod, percentOf } from './report-scope';

export interface ReportSummary {
  noDataMessage: string | null;
  metrics: ReportMetrics;
}

export async function getReportSummary(userId: string, period: string): Promise<ReportSummary> {
  const scoped = entriesInPeriod(await loadLedger(userId), period);
  const totals = totalsOf(scoped);

  return {
    noDataMessage: scoped.length === 0 ? 'Nenhuma transação encontrada.' : null,
    metrics: {
      totalIncome: totals.income,
      totalExpenses: totals.expenses,
      totalInvestments: totals.investments,
      balance: totals.balance,
      expensePercentage: Math.min(100, percentOf(totals.expenses, totals.income)),
      investmentPercentage: percentOf(totals.investments, totals.income),
    },
  };
}
