import { describe, it, expect } from 'vitest';
import { parseEntryMessage } from '@/modules/finance/domain/parsers/parse-entry-message';

describe('parseEntryMessage', () => {
  it('parses valid expense entry with comma decimal', () => {
    const result = parseEntryMessage('saída | mercado | arroz | 25,90');
    expect(result).toEqual({
      type: 'expense',
      category: 'mercado',
      description: 'arroz',
      amount: 25.9,
    });
  });

  it('parses valid income entry with integer amount', () => {
    const result = parseEntryMessage('entrada | salário | empresa X | 5000');
    expect(result).toEqual({
      type: 'income',
      category: 'salário',
      description: 'empresa X',
      amount: 5000,
    });
  });

  it('parses valid investment entry with synonyms and prefix', () => {
    const result = parseEntryMessage('aporte | tesouro | selic | R$ 300,00');
    expect(result).toEqual({
      type: 'investment',
      category: 'tesouro',
      description: 'selic',
      amount: 300,
    });
  });

  it('parses thousand separators', () => {
    const result = parseEntryMessage('gasto | compras | notebook | 3.499,90');
    expect(result).toEqual({
      type: 'expense',
      category: 'compras',
      description: 'notebook',
      amount: 3499.9,
    });
  });

  it('returns null when pipe format is incomplete', () => {
    expect(parseEntryMessage('gasto mercado 50')).toBeNull();
    expect(parseEntryMessage('gasto | mercado | 50')).toBeNull();
    expect(parseEntryMessage('gasto | mercado | arroz | feijao | 50')).toBeNull();
  });

  it('returns null for unknown type', () => {
    expect(parseEntryMessage('outro | mercado | arroz | 25,90')).toBeNull();
  });

  it('returns null for invalid amount', () => {
    expect(parseEntryMessage('saída | mercado | arroz | zero')).toBeNull();
    expect(parseEntryMessage('saída | mercado | arroz | -50')).toBeNull();
  });
});
