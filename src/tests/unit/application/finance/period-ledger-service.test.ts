import { describe, it, expect } from 'vitest';
import { calculateFinancialSnapshot } from '@/modules/finance/domain/services/calculate-financial-snapshot';
import { calculateSnapshotFromTotals } from '@/modules/finance/domain/services/calculate-snapshot-from-totals';
import { periodIdOfMonth } from '@/tests/fakes/fake-ledger-query';
import { sampleLedgerEntries } from '@/tests/fakes/fake-ledger-source';
import { CURRENT_FAKE_MONTH, createFakePeriodLedger } from '@/tests/fakes/fake-period-ledger';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';

const importedExpense: LedgerEntry = {
  id: 'bank-1',
  kind: 'expense',
  date: '2026-03-10',
  description: 'Pix banco',
  category: 'Outros',
  amount: 500,
  account: 'Pluggy',
  imported: true,
  fixed: false,
};

describe('PeriodLedgerService', () => {
  it('resolves the current window with the month the period starts in', async () => {
    const { service } = createFakePeriodLedger();

    const window = await service.currentWindow('user-1');

    expect(window).toMatchObject({ id: periodIdOfMonth(CURRENT_FAKE_MONTH), referenceMonth: CURRENT_FAKE_MONTH });
  });

  it('totals only the requested period', async () => {
    const { service } = createFakePeriodLedger();

    const totals = await service.totals('user-1', periodIdOfMonth('2026-02'));

    expect(totals).toMatchObject({ income: 6000, expenses: 1200.1, investments: 0 });
  });

  it('ignores imported rows in manual mode and keeps them otherwise', async () => {
    const entries = [...sampleLedgerEntries, importedExpense];
    const manual = createFakePeriodLedger({ entries, manualMode: true }).service;
    const connected = createFakePeriodLedger({ entries, manualMode: false }).service;
    const period = periodIdOfMonth(CURRENT_FAKE_MONTH);

    expect((await manual.totals('user-1', period)).expenses).toBe(400.1);
    expect((await connected.totals('user-1', period)).expenses).toBe(900.1);
    expect(await manual.search('user-1', { text: 'banco', limit: 10 })).toEqual([]);
  });

  it('limits and orders searches newest first', async () => {
    const { service } = createFakePeriodLedger();

    const found = await service.search('user-1', { kind: 'expense', limit: 2 });

    expect(found.map((entry) => entry.id)).toEqual(['e3', 'e2']);
  });

  it('builds the same snapshot as the in memory ledger without loading every row', async () => {
    const { service, query } = createFakePeriodLedger();

    const { aggregates } = await service.snapshotData('user-1');
    const fromTotals = calculateSnapshotFromTotals({ aggregates, goals: [] });
    const fromEntries = calculateFinancialSnapshot({
      entries: sampleLedgerEntries,
      goals: [],
      referenceMonth: CURRENT_FAKE_MONTH,
    });

    expect(fromTotals).toEqual(fromEntries);
    expect(query.calls).toBe(6);
  });
});
