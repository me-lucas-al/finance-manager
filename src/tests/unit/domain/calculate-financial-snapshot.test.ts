import { describe, it, expect } from 'vitest';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { calculateFinancialSnapshot } from '@/modules/finance/domain/services/calculate-financial-snapshot';
import { buildOverviewData } from '@/modules/finance/domain/services/build-overview-data';
import { sampleLedgerSource } from '@/tests/fakes/fake-ledger-source';

describe('calculateFinancialSnapshot', () => {
  it('shows the same balance as the dashboard overview', async () => {
    const entries = await new LedgerService(sampleLedgerSource).load('u');

    const snapshot = calculateFinancialSnapshot({ entries, goals: [], referenceMonth: '2026-03' });

    expect(snapshot.balance).toBe(buildOverviewData(entries, '2026-03').bankTotal);
    expect(snapshot.totalInvested).toBe(800);
  });

  it('computes month totals from every source and the Sao Paulo calendar', async () => {
    const entries = await new LedgerService(sampleLedgerSource).load('u');

    const snapshot = calculateFinancialSnapshot({ entries, goals: [], referenceMonth: '2026-03' });

    expect(snapshot.currentMonth).toMatchObject({ totalIncome: 5000, totalExpenses: 400.1, totalInvestments: 800 });
    expect(snapshot.previousMonth.totalIncome).toBe(6000);
    expect(snapshot.currentMonth.savingsRate).toBe(92);
    expect(snapshot.currentMonth.categories).toEqual({ Outros: 300.2, Mercado: 99.9 });
  });

  it('links category metrics to goals case-insensitively', async () => {
    const entries = await new LedgerService(sampleLedgerSource).load('u');
    const goals = [{ id: 'g', userId: 'u', month: '2026-03-01', category: 'mercado', targetAmount: 500 }];

    const snapshot = calculateFinancialSnapshot({ entries, goals: goals as never, referenceMonth: '2026-03' });

    expect(snapshot.categoryMetrics.find((metric) => metric.category === 'Mercado')).toMatchObject({
      currentAmount: 99.9,
      previousAmount: 1200.1,
      goalAmount: 500,
    });
  });
});
