import { describe, it, expect } from 'vitest';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { buildOverviewData } from '@/modules/finance/domain/services/build-overview-data';
import { buildMovementsData } from '@/modules/finance/domain/services/build-movements-data';
import { buildAssetsData } from '@/modules/finance/domain/services/build-assets-data';
import { totalsOf, entriesInMonth } from '@/modules/finance/domain/services/summarize-ledger';
import { buildEvolutionTimeline } from '@/app/(dashboard)/reports/report-timeline-builder';
import { buildCategoryVsGoal } from '@/app/(dashboard)/reports/category-vs-goal';
import { sampleLedgerSource } from '@/tests/fakes/fake-ledger-source';

const loadEntries = () => new LedgerService(sampleLedgerSource).load('u');

describe('single ledger feeds every screen', () => {
  it('uses the Sao Paulo month for entries stored in UTC', async () => {
    const entries = await loadEntries();

    expect(entries.find((entry) => entry.id === 'i2')?.date).toBe('2026-02-28');
    expect(entries.find((entry) => entry.id === 'e2')?.category).toBe('Outros');
  });

  it('gives the same balance on overview, movements, reports and assets', async () => {
    const entries = await loadEntries();
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
    const entries = await loadEntries();

    const march = buildMovementsData(entries, '2026-03');
    const goalChart = buildCategoryVsGoal(entries, '2026-03', [{ category: 'Mercado', targetAmount: 500 }]);

    for (const category of march.categorizedExpenses) {
      expect(goalChart.find((datum) => datum.category === category.name)?.actual).toBe(category.amount);
    }
    expect(goalChart.find((datum) => datum.category === 'Mercado')?.target).toBe(500);
  });
});
