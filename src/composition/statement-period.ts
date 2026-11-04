import { createStatementPeriodResolver } from '@/modules/finance/application/services/statement-period-resolver';
import { periodLedgerService } from './finance';

export const resolveStatementPeriod = createStatementPeriodResolver(periodLedgerService);

export async function readCurrentStatementMonth(userId: string): Promise<string> {
  return (await periodLedgerService.currentWindow(userId)).referenceMonth;
}
