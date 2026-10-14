import type { StatementDocument } from '../../domain/models/statement-document';

const UNSUPPORTED_CHARACTERS = /[^ -~ -ÿ]/gu;

const TYPOGRAPHIC_REPLACEMENTS: Array<[RegExp, string]> = [
  [/[–—]/g, '-'],
  [/[‘’]/g, "'"],
  [/[“”]/g, '"'],
  [/…/g, '...'],
];

export function toPdfText(text: string): string {
  const normalized = TYPOGRAPHIC_REPLACEMENTS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text.normalize('NFC')
  );
  return normalized.replace(UNSUPPORTED_CHARACTERS, '?');
}

export function toPdfSafeDocument(document: StatementDocument): StatementDocument {
  const labeled = ({ label, value }: { label: string; value: string }) => ({
    label: toPdfText(label),
    value: toPdfText(value),
  });
  return {
    ...document,
    appName: toPdfText(document.appName),
    userLabel: toPdfText(document.userLabel),
    filtersLabel: document.filtersLabel && toPdfText(document.filtersLabel),
    summary: document.summary.map(labeled),
    totals: document.totals.map(labeled),
    groups: document.groups.map((group) => ({ ...group, rows: group.rows.map((row) => row.map(toPdfText)) })),
  };
}
