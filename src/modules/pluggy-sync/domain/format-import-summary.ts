import { formatCurrency } from '@/lib/format';
import type { ImportedEntry, ImportedEntryKind } from './import-announcer';

const MAX_LISTED = 5;

const KIND_LABEL: Record<ImportedEntryKind, string> = {
  expense: 'Saída',
  income: 'Entrada',
  investment: 'Investimento',
};

const sumOf = (entries: ImportedEntry[], kind: ImportedEntryKind): number =>
  entries.filter((entry) => entry.kind === kind).reduce((total, entry) => total + entry.amount, 0);

const lineOf = (entry: ImportedEntry): string =>
  `- ${KIND_LABEL[entry.kind]}: ${entry.description} (${entry.bank}) · ${formatCurrency(entry.amount)}`;

function totalsLine(entries: ImportedEntry[]): string {
  const parts = [
    { label: 'Saídas', value: sumOf(entries, 'expense') },
    { label: 'Entradas', value: sumOf(entries, 'income') },
    { label: 'Investimentos', value: sumOf(entries, 'investment') },
  ];
  return parts
    .filter((part) => part.value > 0)
    .map((part) => `${part.label} ${formatCurrency(part.value)}`)
    .join(' | ');
}

export function formatImportSummary(entries: ImportedEntry[]): string {
  const noun = entries.length === 1 ? 'novo lançamento importado' : 'novos lançamentos importados';
  const listed = entries.slice(0, MAX_LISTED).map(lineOf);
  const hidden = entries.length - listed.length;
  const more = hidden > 0 ? [`... e mais ${hidden}`] : [];
  return [`🏦 *Pluggy:* ${entries.length} ${noun}`, ...listed, ...more, totalsLine(entries)].join('\n');
}
