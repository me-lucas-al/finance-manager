import { describe, it, expect } from 'vitest';
import { mentionsCreditCard } from '@/modules/finance/domain/services/mentions-credit-card';

const CARDS = ['Nubank', 'Itaú Platinum'];

describe('mentionsCreditCard', () => {
  it.each([
    'paguei 300 de fatura',
    'paguei a fatura',
    'gastei 300 no cartão',
    'gastei 300 no cartao de crédito',
    'comprei 300 no crédito',
    'comprei 300 pelo cartão',
    'fatura do cartão 300',
    'fatura do Nubank 300',
    'paguei 80 no nubank',
    'gastei 40 no cartão nubank',
    'paguei fatura do itau platinum',
  ])('detects: %s', (text) => {
    expect(mentionsCreditCard(text, CARDS)).toBe(true);
  });

  it.each([
    'paguei fatura de luz 150',
    'fatura da internet 100',
    'comprei cartão de visita por 50',
    'crédito no celular 30',
    'recarga de crédito 20',
    'gastei 50 no almoço',
    'paguei 100 de internet',
    'paguei o nubankar 10',
  ])('ignores: %s', (text) => {
    expect(mentionsCreditCard(text, CARDS)).toBe(false);
  });

  it('never matches registered names when there are none', () => {
    expect(mentionsCreditCard('gastei 50 no nubank', [])).toBe(false);
  });

  it('is case and accent insensitive for card names', () => {
    expect(mentionsCreditCard('FATURA DO ITAÚ PLATINUM', CARDS)).toBe(true);
  });
});
