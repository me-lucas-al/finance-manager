import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/lib/format';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { DEFAULT_STATEMENT_FILTERS } from '@/modules/finance/domain/models/statement-filters';
import { buildStatementDocument } from '@/modules/finance/domain/services/statement-pdf-rows';
import { totalsOf } from '@/modules/finance/domain/services/summarize-ledger';

const entry = (overrides: Partial<LedgerEntry>): LedgerEntry => ({
  id: 'e',
  kind: 'expense',
  date: '2026-03-10',
  description: 'Padaria',
  category: 'Mercado',
  amount: 10,
  account: 'Manual',
  ...overrides,
});

const entries = [
  entry({ id: '1', date: '2026-03-12', description: 'Salário', kind: 'income', category: 'Salário', amount: 3000 }),
  entry({ id: '2', date: '2026-03-12', description: 'Mercado', amount: 150.5 }),
  entry({ id: '3', date: '2026-03-05', description: 'CDB', kind: 'investment', category: 'Renda Fixa', amount: 500 }),
];

const build = (overrides = {}) =>
  buildStatementDocument({
    entries,
    month: '2026-03',
    filters: DEFAULT_STATEMENT_FILTERS,
    accumulatedBalance: 1234.5,
    userLabel: 'Lucas',
    generatedAt: '13/10/2026 09:30',
    ...overrides,
  });

describe('buildStatementDocument', () => {
  it('describes the header', () => {
    const document = build();

    expect(document).toMatchObject({
      appName: 'Finance Manager',
      userLabel: 'Lucas',
      monthLabel: 'Março de 2026',
      generatedAt: '13/10/2026 09:30',
      filtersLabel: null,
    });
  });

  it('groups rows by date keeping the entry order', () => {
    const { groups } = build();

    expect(groups.map((group) => group.date)).toEqual(['12/03/2026', '05/03/2026']);
    expect(groups[0].rows).toHaveLength(2);
    expect(groups[0].rows[0]).toEqual(['Salário', 'Salário', 'Receita', formatCurrency(3000)]);
    expect(groups[0].rows[1][3]).toBe(formatCurrency(-150.5));
    expect(groups[1].rows[0][2]).toBe('Investimento');
  });

  it('keeps every row aligned with the declared columns', () => {
    const { columns, groups } = build();

    expect(columns.map((column) => column.header)).toEqual(['Descrição', 'Categoria', 'Tipo', 'Valor']);
    for (const group of groups) for (const row of group.rows) expect(row).toHaveLength(columns.length);
  });

  it('summarises with the same totals as totalsOf', () => {
    const totals = totalsOf(entries);
    const { summary } = build();

    expect(summary.map((item) => item.value)).toEqual([
      formatCurrency(totals.income),
      formatCurrency(totals.expenses),
      formatCurrency(totals.investments),
      formatCurrency(totals.balance),
      formatCurrency(1234.5),
    ]);
  });

  it('lists totals and counts per kind', () => {
    const { totals } = build();

    expect(totals).toEqual([
      { label: 'Receitas (1)', value: formatCurrency(3000) },
      { label: 'Despesas (1)', value: formatCurrency(150.5) },
      { label: 'Investimentos (1)', value: formatCurrency(500) },
    ]);
  });

  it('describes the active filters', () => {
    const filters = { type: 'expense' as const, category: 'Mercado', query: 'pão' };

    expect(build({ filters }).filtersLabel).toBe('Tipo: Despesas | Categoria: Mercado | Busca: "pão"');
  });

  it('builds an empty body for an empty selection', () => {
    const document = build({ entries: [] });
    expect(document.groups).toEqual([]);
    expect(document.totals.every((item) => item.value === formatCurrency(0))).toBe(true);
  });
});
