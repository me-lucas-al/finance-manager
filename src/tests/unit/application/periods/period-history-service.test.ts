import { describe, it, expect } from 'vitest';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { PeriodHistoryService } from '@/modules/periods/application/services/period-history-service';
import { income, investment, transaction } from '@/tests/fakes/fake-ledger-source';
import {
  FakePeriodHistorySource,
  periodRecord,
  snapshotRecord,
} from '@/tests/fakes/fake-period-history-source';

const ledgerSource = {
  findAllTransactions: async () => [
    transaction('e-in', '2026-01-20', 100, 'Mercado'),
    transaction('e-out', '2026-03-20', 50, 'Mercado'),
  ],
  findAllIncomes: async () => [income('i-in', '2026-01-16T15:00:00Z', '3000.00')],
  findAllInvestments: async () => [investment('v-in', '2026-01-18T15:00:00Z', '500.00')],
};

const refs = [
  { periodId: 'closed', kind: 'income' as const, id: 'i-in' },
  { periodId: 'closed', kind: 'investment' as const, id: 'v-in' },
];

const buildService = (periods = [
  periodRecord('closed', '2026-01-15', '2026-02-14', 'CLOSED'),
  periodRecord('open', '2026-03-15', '2026-04-14', 'OPEN'),
  periodRecord('foreign', '2026-01-15', '2026-02-14', 'CLOSED', 'other-user'),
]) =>
  new PeriodHistoryService(
    new FakePeriodHistorySource(periods, [snapshotRecord('closed', { totalExpenses: 111 })], refs),
    (userId) => new LedgerService(ledgerSource).load(userId)
  );

describe('PeriodHistoryService.findDetail', () => {
  it('returns the closed period with snapshot totals and its entries', async () => {
    const detail = await buildService().findDetail('u', 'closed');

    expect(detail?.closed).toBe(true);
    expect(detail?.totals.expenses).toBe(111);
    expect(detail?.entries.map((entry) => entry.id).sort()).toEqual(['e-in', 'i-in', 'v-in']);
  });

  it('computes live totals for an open period', async () => {
    const detail = await buildService().findDetail('u', 'open');

    expect(detail?.snapshot).toBeNull();
    expect(detail?.totals).toEqual({ income: 0, expenses: 50, investments: 0, balance: -50 });
    expect(detail?.entries.map((entry) => entry.id)).toEqual(['e-out']);
  });

  it('returns null for an unknown id', async () => {
    expect(await buildService().findDetail('u', 'missing')).toBeNull();
  });

  it('returns null for a period that belongs to another user', async () => {
    expect(await buildService().findDetail('u', 'foreign')).toBeNull();
  });
});

describe('PeriodHistoryService.listHistory', () => {
  it('lists only own periods, newest first, with totals', async () => {
    const history = await buildService().listHistory('u');

    expect(history.map((item) => item.id)).toEqual(['open', 'closed']);
    expect(history[1].totals.income).toBe(5000);
  });
});
