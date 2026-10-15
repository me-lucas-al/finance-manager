import { describe, it, expect } from 'vitest';
import { EDIT_USAGE_MESSAGE, parseEditCommand } from '@/modules/finance/domain/parsers/parse-edit-command';
import { parseEditDate } from '@/modules/finance/domain/parsers/parse-edit-date';

const today = '2026-03-15';

describe('parseEditCommand', () => {
  it('reads the amount in Brazilian format', () => {
    expect(parseEditCommand('valor 45,90', today)).toEqual({ ok: true, changes: { amount: 45.9 } });
  });

  it('keeps the description text as typed, with accents and spaces', () => {
    expect(parseEditCommand('descrição Almoço com a Equipe', today)).toEqual({
      ok: true,
      changes: { description: 'Almoço com a Equipe' },
    });
    expect(parseEditCommand('descricao pizza', today)).toEqual({ ok: true, changes: { description: 'pizza' } });
  });

  it('reads the category', () => {
    expect(parseEditCommand('Categoria Mercado Livre', today)).toEqual({ ok: true, changes: { category: 'Mercado Livre' } });
  });

  it('reads ISO and day/month dates', () => {
    expect(parseEditCommand('data 2026-02-10', today)).toEqual({ ok: true, changes: { date: '2026-02-10' } });
    expect(parseEditCommand('data 10/02', today)).toEqual({ ok: true, changes: { date: '2026-02-10' } });
  });

  it.each(['', 'valor', 'peso 10', 'descricao   '])('answers %j with the usage message', (input) => {
    expect(parseEditCommand(input, today)).toEqual({ ok: false, message: EDIT_USAGE_MESSAGE });
  });

  it('rejects invalid amounts and dates with a specific message', () => {
    expect(parseEditCommand('valor abc', today)).toMatchObject({ ok: false, message: expect.stringContaining('Valor inválido') });
    expect(parseEditCommand('valor 0', today)).toMatchObject({ ok: false });
    expect(parseEditCommand('data 31/02', today)).toMatchObject({ ok: false, message: expect.stringContaining('Data inválida') });
  });
});

describe('parseEditDate', () => {
  it('accepts day/month with the current year and day/month/year', () => {
    expect(parseEditDate('5/3', today)).toBe('2026-03-05');
    expect(parseEditDate('05/03/2025', today)).toBe('2025-03-05');
    expect(parseEditDate('2026-03-05', today)).toBe('2026-03-05');
  });

  it('rejects impossible and malformed dates', () => {
    expect(parseEditDate('2026-13-01', today)).toBeNull();
    expect(parseEditDate('29/02', today)).toBeNull();
    expect(parseEditDate('ontem', today)).toBeNull();
  });
});
