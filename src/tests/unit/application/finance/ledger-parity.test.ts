import { describe, it, expect } from 'vitest';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import type { LedgerSource } from '@/modules/finance/domain/ports/ledger-source';
import type { Transaction } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { Income } from '@/modules/finance/domain/repositories/income-repository';
import type { Investment } from '@/modules/finance/domain/repositories/investment-repository';
import { buildOverviewData } from '@/modules/finance/domain/services/build-overview-data';
import { buildMovementsData } from '@/modules/finance/domain/services/build-movements-data';
import { buildAssetsData } from '@/modules/finance/domain/services/build-assets-data';
import { totalsOf, entriesInMonth } from '@/modules/finance/domain/services/summarize-ledger';
import { buildEvolutionTimeline } from '@/app/(dashboard)/reports/report-timeline-builder';
import { buildCategoryVsGoal } from '@/app/(dashboard)/reports/category-vs-goal';

const transaction = (id: string, occurredAt: string, amount: number, category: string | null): Transaction => ({
  id,
  userId: 'u',
  pluggyTransactionId: null,
  accountId: null,
  bank: 'Manual',
  amount,
  description: id,
  occurredAt,
  category,
  categorySuggested: null,
  reason: null,
  status: 'categorized',
  source: 'manual',
  necessity: null,
  telegramQuestionMessageId: null,
  createdAt: '2026-01-01T00:00:00Z',
});

const income = (id: string, receivedAt: string, amount: string): Income => ({
  id,
  userId: 'u',
  periodId: 'p',
  description: id,
  amount,
  category: 'Salário',
  receivedAt: new Date(receivedAt),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const investment = (id: string, date: string, amount: string): Investment => ({
  id,
  userId: 'u',
  periodId: 'p',
  description: id,
  amount,
  type: 'CDB',
  date: new Date(date),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const source: LedgerSource = {
  findAllTransactions: async () => [
    transaction('e1', '2026-02-10', 1200.1, 'Mercado'),
    transaction('e2', '2026-03-02', 300.2, null),
    transaction('e3', '2026-03-05', 99.9, 'Mercado'),
  ],
  findAllIncomes: async () => [
    income('i1', '2026-02-05T15:00:00Z', '5000.00'),
    income('i2', '2026-03-01T02:00:00Z', '1000.00'),
    income('i3', '2026-03-05T15:00:00Z', '5000.00'),
  ],
  findAllInvestments: async () => [investment('v1', '2026-03-03T15:00:00Z', '800.00')],
};

describe('single ledger feeds every screen', () => {
  it('uses the Sao Paulo month for entries stored in UTC', async () => {
    const entries = await new LedgerService(source).load('u');

    const lateIncome = entries.find((entry) => entry.id === 'i2');
    expect(lateIncome?.date).toBe('2026-02-28');
    expect(entries.find((entry) => entry.id === 'e2')?.category).toBe('Outros');
  });

  it('gives the same balance on overview, movements, reports and assets', async () => {
    const entries = await new LedgerService(source).load('u');
    const expectedBalance = 11000 - 1600.2 - 800;

    const overview = buildOverviewData(entries, '2026-03');
    const february = buildMovementsData(entries, '2026-02');
    const march = buildMovementsData(entries, '2026-03');
    const assets = buildAssetsData(entries);
    const timeline = buildEvolutionTimeline(entries, '2026-03');

    expect(overview.bankTotal).toBeCloseTo(expectedBalance, 2);
    expect(overview.evolutionBalance).toBe(overview.bankTotal);
    expect(overview.evolutionData.at(-1)?.value).toBe(overview.bankTotal);
    expect(february.netBalance + march.netBalance).toBeCloseTo(expectedBalance, 2);
    expect(overview.investmentTotal).toBe(assets.total);
    expect(march.totalInvestments).toBe(assets.total);
    expect(timeline.at(-1)).toMatchObject({ income: 5000, expenses: 400.1, investments: 800 });
    expect(totalsOf(entriesInMonth(entries, '2026-02')).income).toBe(6000);
  });

  it('keeps category spending equal between movements and goals chart', async () => {
    const entries = await new LedgerService(source).load('u');

    const march = buildMovementsData(entries, '2026-03');
    const goalChart = buildCategoryVsGoal(entries, '2026-03', [{ category: 'Mercado', targetAmount: 500 }]);

    for (const category of march.categorizedExpenses) {
      expect(goalChart.find((datum) => datum.category === category.name)?.actual).toBe(category.amount);
    }
    expect(goalChart.find((datum) => datum.category === 'Mercado')?.target).toBe(500);
  });
});
