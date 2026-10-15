import { describe, it, expect, vi } from 'vitest';
import { ShowCreditCardsUseCase } from '@/modules/finance/application/credit-cards/show-credit-cards';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import type { CreditCardUsage } from '@/modules/finance/domain/models/credit-card';
import type { DataMode } from '@/modules/users/domain/models/user';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

const usage = (overrides: Partial<CreditCardUsage> & { card: CreditCardUsage['card'] }): CreditCardUsage => ({
  used: 0,
  percentage: 0,
  cycle: { start: '2026-10-01', end: '2026-10-31' },
  ...overrides,
});

function build(mode: DataMode | null, usages: CreditCardUsage[] = []) {
  const listUsage = vi.fn(async () => usages);
  return { useCase: new ShowCreditCardsUseCase(async () => mode, { execute: listUsage }), listUsage };
}

describe('ShowCreditCardsUseCase', () => {
  it('explains that cards come from the bank in pluggy mode', async () => {
    const { useCase, listUsage } = build('pluggy');

    expect(await useCase.execute('user-1')).toContain('banco conectado');
    expect(listUsage).not.toHaveBeenCalled();
  });

  it('explains how to register the first card when there are none', async () => {
    const message = await build('manual').useCase.execute('user-1');

    expect(message).toContain('ainda não tem cartões');
    expect(message).toContain('cadastrar cartão');
  });

  it('lists each card with usage, limit and closing day', async () => {
    const { useCase } = build('manual', [
      usage({ card: makeCreditCard({ name: 'Nubank', lastDigits: '1234', creditLimit: 2000, closingDay: 10 }), used: 500, percentage: 25 }),
      usage({ card: makeCreditCard({ id: 'b', name: 'Inter', lastDigits: null, creditLimit: 1000, closingDay: null }), used: 0, percentage: 0 }),
    ]);

    const message = await useCase.execute('user-1');

    expect(message).toContain('Nubank •••• 1234');
    expect(message).toContain('25%');
    expect(message).toContain('fecha dia 10');
    expect(message).toContain('Inter');
    expect(message).toContain('fatura do mês');
  });
});

describe('/cartoes bot command', () => {
  const bot = new HandleBotCommandUseCase(
    {} as never,
    { execute: async () => '' },
    {} as never,
    {} as never,
    {} as never,
    { execute: async () => '' },
    { execute: async () => 'lista de cartões' }
  );

  it('answers with the cards report', async () => {
    expect(await bot.execute('user-1', '/cartoes')).toBe('lista de cartões');
  });

  it('is advertised in the help message', async () => {
    expect(await bot.execute('user-1', '/ajuda')).toContain('/cartoes');
  });
});
