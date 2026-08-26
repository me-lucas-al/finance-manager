import { describe, it, expect } from 'vitest';
import { normalizeBankName } from '../../../lib/pluggy';

describe('normalizeBankName', () => {
  it('maps Itaú connector names to "itau"', () => {
    expect(normalizeBankName('Itaú')).toBe('itau');
    expect(normalizeBankName('Itaú Unibanco')).toBe('itau');
  });

  it('maps Nubank connector names to "nubank"', () => {
    expect(normalizeBankName('Nubank')).toBe('nubank');
  });

  it('maps Inter connector names to "inter"', () => {
    expect(normalizeBankName('Banco Inter')).toBe('inter');
  });

  it('is case-insensitive and accent-insensitive', () => {
    expect(normalizeBankName('ITAU')).toBe('itau');
    expect(normalizeBankName('iTaú')).toBe('itau');
  });

  it('falls back to the raw connector name for other institutions', () => {
    expect(normalizeBankName('Banco do Brasil')).toBe('Banco do Brasil');
  });
});
