import { describe, it, expect } from 'vitest';
import { translateCategory } from '@/modules/pluggy-sync/domain/translate-category';

describe('translateCategory', () => {
  it('translates the Pluggy names found in real imports', () => {
    expect(translateCategory('Transfer - PIX')).toBe('Transferências');
    expect(translateCategory('Taxi and ride-hailing')).toBe('Transporte');
    expect(translateCategory('Groceries')).toBe('Alimentação');
    expect(translateCategory('Proceeds interests and dividends')).toBe('Rendimentos');
  });

  it('ignores case and surrounding spaces', () => {
    expect(translateCategory('  TRANSFERS ')).toBe('Transferências');
  });

  it('keeps names that are already in Portuguese or unknown', () => {
    expect(translateCategory('Lazer')).toBe('Lazer');
    expect(translateCategory('Pet supplies')).toBe('Pet supplies');
  });

  it('falls back to Outros when there is no category', () => {
    expect(translateCategory(null)).toBe('Outros');
    expect(translateCategory('   ')).toBe('Outros');
  });
});
