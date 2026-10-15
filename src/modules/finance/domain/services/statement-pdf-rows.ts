import { formatCurrency } from '@/lib/format';
import { formatDateBr } from '@/lib/format-date-time';
import { monthLabel } from '@/lib/month';
import type { LedgerEntry, LedgerKind } from '../models/ledger-entry';
import { ALL_OPTION, type StatementFilters } from '../models/statement-filters';
import type { StatementColumn, StatementDocument, StatementGroup } from '../models/statement-document';
import { signedAmount } from './signed-amount';
import { totalsOf, type LedgerTotals } from './summarize-ledger';

export type StatementBuildInput = {
  entries: LedgerEntry[];
  month: string;
  filters: StatementFilters;
  accumulatedBalance: number;
  userLabel: string;
  generatedAt: string;
};

type ColumnDefinition = StatementColumn & { cell: (entry: LedgerEntry) => string };

const APP_NAME = 'Finance Manager';

const KIND_LABEL: Record<LedgerKind, string> = {
  income: 'Receita',
  expense: 'Despesa',
  investment: 'Investimento',
};

const KIND_PLURAL_LABEL: Record<LedgerKind, string> = {
  income: 'Receitas',
  expense: 'Despesas',
  investment: 'Investimentos',
};

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { header: 'Descrição', align: 'left', cell: (entry) => entry.description },
  { header: 'Categoria', align: 'left', cell: (entry) => entry.category },
  { header: 'Tipo', align: 'left', cell: (entry) => KIND_LABEL[entry.kind] },
  { header: 'Valor', align: 'right', cell: (entry) => formatCurrency(signedAmount(entry.kind, entry.amount)) },
];

function groupByDate(entries: LedgerEntry[]): StatementGroup[] {
  const byDate = new Map<string, string[][]>();
  for (const entry of entries) {
    const row = COLUMN_DEFINITIONS.map((column) => column.cell(entry));
    byDate.set(entry.date, [...(byDate.get(entry.date) ?? []), row]);
  }
  return Array.from(byDate, ([date, rows]) => ({ date: formatDateBr(date), rows }));
}

function describeFilters(filters: StatementFilters): string | null {
  const parts = [
    filters.type !== ALL_OPTION ? `Tipo: ${KIND_PLURAL_LABEL[filters.type]}` : '',
    filters.category !== ALL_OPTION ? `Categoria: ${filters.category}` : '',
    filters.query ? `Busca: "${filters.query}"` : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' | ') : null;
}

function totalsPerKind(entries: LedgerEntry[], totals: LedgerTotals) {
  const totalOfKind: Record<LedgerKind, number> = {
    income: totals.income,
    expense: totals.expenses,
    investment: totals.investments,
  };
  return (Object.keys(KIND_PLURAL_LABEL) as LedgerKind[]).map((kind) => {
    const count = entries.filter((entry) => entry.kind === kind).length;
    return { label: `${KIND_PLURAL_LABEL[kind]} (${count})`, value: formatCurrency(totalOfKind[kind]) };
  });
}

export function buildStatementDocument(input: StatementBuildInput): StatementDocument {
  const totals = totalsOf(input.entries);
  return {
    appName: APP_NAME,
    userLabel: input.userLabel,
    monthLabel: monthLabel(input.month),
    generatedAt: input.generatedAt,
    filtersLabel: describeFilters(input.filters),
    summary: [
      { label: 'Receitas', value: formatCurrency(totals.income) },
      { label: 'Despesas', value: formatCurrency(totals.expenses) },
      { label: 'Investimentos', value: formatCurrency(totals.investments) },
      { label: 'Resultado do período', value: formatCurrency(totals.balance) },
      { label: 'Saldo acumulado até o fim do mês', value: formatCurrency(input.accumulatedBalance) },
    ],
    columns: COLUMN_DEFINITIONS.map(({ header, align }) => ({ header, align })),
    groups: groupByDate(input.entries),
    totals: totalsPerKind(input.entries, totals),
  };
}
