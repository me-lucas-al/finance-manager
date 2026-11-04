import { describe, it, expect, vi } from 'vitest';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import type { StatementDocument } from '@/modules/finance/domain/models/statement-document';
import { DEFAULT_STATEMENT_FILTERS } from '@/modules/finance/domain/models/statement-filters';
import { StatementPdfService } from '@/modules/finance/application/services/statement-pdf-service';
import type { StatementPeriodResolver } from '@/modules/finance/application/services/statement-period-resolver';
import { monthRange } from '@/modules/finance/domain/models/date-range';
import { buildMovementsData } from '@/modules/finance/domain/services/build-movements-data';
import { totalsOf } from '@/modules/finance/domain/services/summarize-ledger';
import { formatCurrency } from '@/lib/format';

const entry = (id: string, overrides: Partial<LedgerEntry>): LedgerEntry => ({
  id,
  kind: 'expense',
  date: '2026-03-10',
  description: id,
  category: 'Mercado',
  amount: 10,
  account: 'Manual',
  fixed: false,
  ...overrides,
});

const ledger = [
  entry('a', { date: '2026-03-02', amount: 100 }),
  entry('b', { date: '2026-03-15', kind: 'income', category: 'Salário', amount: 2000 }),
  entry('c', { date: '2026-03-20', category: 'Transporte', amount: 40 }),
  entry('d', { date: '2026-02-10', kind: 'income', category: 'Salário', amount: 500 }),
  entry('e', { date: '2026-04-01', amount: 999 }),
];

const resolveCalendarMonth: StatementPeriodResolver = async (_userId, month) => ({
  range: monthRange(month),
  label: 'Março de 2026',
});

function setup(resolvePeriod: StatementPeriodResolver = resolveCalendarMonth) {
  const render = vi.fn<(document: StatementDocument) => Uint8Array>(() => new Uint8Array([37, 80, 68, 70]));
  const load = vi.fn().mockResolvedValue(ledger);
  const service = new StatementPdfService(load, resolvePeriod, { render }, () => new Date('2026-10-13T12:30:00Z'));
  return { service, render, load };
}

const rowDescriptions = (document: StatementDocument) =>
  document.groups.flatMap((group) => group.rows.map((row) => row[0]));

describe('StatementPdfService', () => {
  it('loads the ledger of the user and returns the rendered bytes', async () => {
    const { service, load } = setup();

    const bytes = await service.generate({
      userId: 'u1',
      userLabel: 'Lucas',
      month: '2026-03',
      filters: DEFAULT_STATEMENT_FILTERS,
    });

    expect(load).toHaveBeenCalledWith('u1');
    expect(Array.from(bytes)).toEqual([37, 80, 68, 70]);
  });

  it('renders only the month entries with the accumulated balance up to that month', async () => {
    const { service, render } = setup();

    await service.generate({ userId: 'u1', userLabel: 'Lucas', month: '2026-03', filters: DEFAULT_STATEMENT_FILTERS });

    const document = render.mock.calls[0][0];
    expect(rowDescriptions(document)).toEqual(['a', 'b', 'c']);
    expect(document.generatedAt).toBe('13/10/2026 09:30');
    expect(document.summary.at(-1)?.value).toBe(formatCurrency(totalsOf(ledger.slice(0, 4)).balance));
  });

  it('renders the entries of a period that crosses two months, labelled with that period', async () => {
    const period: StatementPeriodResolver = async () => ({
      range: { from: '2026-02-10', to: '2026-03-09' },
      label: 'Fevereiro de 2026 · 10/02 a 09/03',
    });
    const { service, render } = setup(period);

    await service.generate({ userId: 'u1', userLabel: 'Lucas', month: '2026-02', filters: DEFAULT_STATEMENT_FILTERS });

    const document = render.mock.calls[0][0];
    expect(rowDescriptions(document)).toEqual(['a', 'd']);
    expect(document.monthLabel).toBe('Fevereiro de 2026 · 10/02 a 09/03');
    expect(document.summary.at(-1)?.value).toBe(formatCurrency(totalsOf([ledger[0], ledger[3]]).balance));
  });

  it('shows the same selection as the screen for the same filters', async () => {
    const { service, render } = setup();
    const filters = { type: 'expense' as const, category: 'Transporte', query: '' };

    await service.generate({ userId: 'u1', userLabel: 'Lucas', month: '2026-03', filters });

    const screen = buildMovementsData(ledger, monthRange('2026-03'), filters).transactions.map((item) => item.description);
    expect(rowDescriptions(render.mock.calls[0][0])).toEqual(screen);
    expect(screen).toEqual(['c']);
  });
});
