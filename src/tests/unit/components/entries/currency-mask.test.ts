import { describe, it, expect } from 'vitest';
import { amountToMaskedInput, maskCurrencyInput } from '@/components/entries/currency-mask';
import { parseCurrencyAmount } from '@/modules/finance/domain/parsers/parse-currency-amount';

describe('maskCurrencyInput', () => {
  it.each([
    ['', ''],
    ['abc', ''],
    ['0', ''],
    ['5', '0,05'],
    ['45', '0,45'],
    ['459', '4,59'],
    ['4590', '45,90'],
    ['123456', '1.234,56'],
    ['100000000', '1.000.000,00'],
    ['R$ 12,5x', '1,25'],
    ['0007', '0,07'],
  ])('masks %j as %j', (typed, expected) => {
    expect(maskCurrencyInput(typed)).toBe(expected);
  });

  it('is idempotent when the masked value is typed over again', () => {
    expect(maskCurrencyInput(maskCurrencyInput('123456'))).toBe('1.234,56');
  });

  it('caps the number of digits', () => {
    expect(maskCurrencyInput('9'.repeat(20))).toBe('9.999.999.999,99');
  });

  it('keeps the masked text readable by parseCurrencyAmount', () => {
    expect(parseCurrencyAmount(maskCurrencyInput('123456'))).toBe(1234.56);
    expect(parseCurrencyAmount(maskCurrencyInput('5'))).toBe(0.05);
  });
});

describe('amountToMaskedInput', () => {
  it('formats stored amounts with cents', () => {
    expect(amountToMaskedInput(45.9)).toBe('45,90');
    expect(amountToMaskedInput(1234.5)).toBe('1.234,50');
    expect(amountToMaskedInput(100)).toBe('100,00');
  });
});
