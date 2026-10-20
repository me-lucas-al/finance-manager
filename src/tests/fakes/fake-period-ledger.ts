import { PeriodLedgerService } from '@/modules/finance/application/services/period-ledger-service';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import type { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import type { Period } from '@/modules/periods/domain/repositories/period-repository';
import { FakeLedgerQuery, periodIdOfMonth } from './fake-ledger-query';
import { sampleLedgerEntries } from './fake-ledger-source';

export const CURRENT_FAKE_MONTH = '2026-03';

const periodStartingIn = (userId: string, month: string): Period => ({
  id: periodIdOfMonth(month),
  userId,
  startDate: new Date(`${month}-15T03:00:00Z`),
  endDate: new Date(`${month}-28T02:59:59Z`),
  status: month === CURRENT_FAKE_MONTH ? 'OPEN' : 'CLOSED',
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export type FakePeriodLedgerOptions = { entries?: LedgerEntry[]; manualMode?: boolean };

export function createFakePeriodLedger(options: FakePeriodLedgerOptions = {}) {
  const query = new FakeLedgerQuery(options.entries ?? sampleLedgerEntries);
  const currentPeriod = { execute: async (userId: string) => periodStartingIn(userId, CURRENT_FAKE_MONTH) };
  const service = new PeriodLedgerService(
    query,
    { isManualMode: async () => options.manualMode ?? false },
    currentPeriod as unknown as ResolveCurrentPeriodUseCase,
    { findByStartMonth: async (userId, month) => periodStartingIn(userId, month) },
  );
  return { service, query };
}
