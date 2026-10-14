import { describe, it, expect } from 'vitest';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { DEFAULT_STATEMENT_FILTERS } from '@/modules/finance/domain/models/statement-filters';
import { buildStatementDocument } from '@/modules/finance/domain/services/statement-pdf-rows';
import { JsPdfStatementRenderer } from '@/modules/finance/infrastructure/pdf/jspdf-statement-renderer';
import { toPdfText } from '@/modules/finance/infrastructure/pdf/pdf-text';

const manyEntries: LedgerEntry[] = Array.from({ length: 120 }, (_, index) => ({
  id: `e${index}`,
  kind: index % 7 === 0 ? 'income' : 'expense',
  date: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
  description: `Lançamento ${index} – ação`,
  category: 'Alimentação',
  amount: 10 + index,
  account: 'Manual',
}));

const render = (entries: LedgerEntry[]) =>
  new JsPdfStatementRenderer().render(
    buildStatementDocument({
      entries,
      month: '2026-03',
      filters: DEFAULT_STATEMENT_FILTERS,
      accumulatedBalance: 100,
      userLabel: 'Lucas Souza',
      generatedAt: '13/10/2026 09:30',
    })
  );

const asText = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes);

describe('JsPdfStatementRenderer', () => {
  it('produces a non-empty pdf', () => {
    const bytes = render(manyEntries.slice(0, 3));

    expect(bytes.length).toBeGreaterThan(500);
    expect(asText(bytes.slice(0, 5))).toBe('%PDF-');
    expect(asText(bytes.slice(-6))).toContain('%%EOF');
  });

  it('keeps pt-BR accents in the content', () => {
    const text = asText(render(manyEntries.slice(0, 3)));

    expect(text).toContain('Descrição');
    expect(text).toContain('Março de 2026');
  });

  it('paginates long statements', () => {
    const pageCount = (asText(render(manyEntries)).match(/\/Type \/Page\b(?!s)/g) ?? []).length;

    expect(pageCount).toBeGreaterThan(1);
  });

  it('renders an empty statement', () => {
    expect(asText(render([]).slice(0, 5))).toBe('%PDF-');
  });
});

describe('toPdfText', () => {
  it('keeps latin-1 letters and replaces unsupported characters', () => {
    expect(toPdfText('Ação à vista')).toBe('Ação à vista');
    expect(toPdfText('a – b “c” …')).toBe('a - b "c" ...');
    expect(toPdfText('pizza 🍕')).toBe('pizza ?');
  });
});
