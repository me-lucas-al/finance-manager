import { describe, it, expect } from 'vitest';
import { formatImportSummary } from '@/modules/pluggy-sync/domain/format-import-summary';
import type { ImportedEntry } from '@/modules/pluggy-sync/domain/import-announcer';

const entry = (overrides: Partial<ImportedEntry> = {}): ImportedEntry => ({
  kind: 'expense',
  description: 'Pix enviado Maria',
  amount: 40,
  bank: 'Itaú',
  ...overrides,
});

describe('formatImportSummary', () => {
  it('describes a single entry in the singular', () => {
    const text = formatImportSummary([entry()]);

    expect(text).toContain('1 novo lançamento importado');
    expect(text).toMatch(/- Saída: Pix enviado Maria \(Itaú\) · R\$\s?40,00/);
  });

  it('totals each kind that appeared', () => {
    const text = formatImportSummary([
      entry({ amount: 40 }),
      entry({ amount: 10 }),
      entry({ kind: 'income', amount: 100 }),
    ]);

    expect(text).toContain('3 novos lançamentos importados');
    expect(text).toMatch(/Saídas R\$\s?50,00 \| Entradas R\$\s?100,00/);
    expect(text).not.toContain('Investimentos');
  });

  it('lists only the first five entries and counts the rest', () => {
    const entries = Array.from({ length: 8 }, (_, index) => entry({ description: `Item ${index + 1}` }));

    const text = formatImportSummary(entries);

    expect(text).toContain('Item 5');
    expect(text).not.toContain('Item 6');
    expect(text).toContain('... e mais 3');
  });
});
