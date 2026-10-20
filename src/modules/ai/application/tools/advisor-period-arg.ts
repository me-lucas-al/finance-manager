import type { PeriodLedgerService } from '@/modules/finance/application/services/period-ledger-service';
import { isValidMonthKey } from '@/modules/finance/domain/parsers/parse-entry-date';

export type AdvisorQueryDeps = {
  userId: string;
  periodLedger: PeriodLedgerService;
};

export const INVALID_MONTH = { erro: 'Período deve estar no formato YYYY-MM' };

export const hasInvalidMonth = (...months: Array<string | undefined>): boolean =>
  months.some((month) => month !== undefined && !isValidMonthKey(month));

export async function periodIdStartingIn(deps: AdvisorQueryDeps, month: string): Promise<string | null> {
  const window = await deps.periodLedger.windowForMonth(deps.userId, month);
  return window?.id ?? null;
}

export async function periodIdOrCurrent(deps: AdvisorQueryDeps, month: string | undefined): Promise<string | null> {
  if (month) return periodIdStartingIn(deps, month);
  return (await deps.periodLedger.currentWindow(deps.userId)).id;
}
