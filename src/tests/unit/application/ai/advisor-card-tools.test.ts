import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildAdvisorCardTools } from '@/modules/ai/application/tools/advisor-card-tools';
import { PLUGGY_MODE_REFUSAL } from '@/modules/ai/application/tools/advisor-card-mode';
import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';
import { EntryNotFoundError, EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

const execute = () => vi.fn();

describe('Advisor credit card tools', () => {
  let services: { [K in Exclude<keyof AdvisorCreditCardServices, 'readDataMode'>]: { execute: ReturnType<typeof vi.fn> } };
  let mode: 'manual' | 'pluggy' | null;

  const run = (name: string, args: Record<string, unknown> = {}, turnId = 'turn-2') => {
    const tools = buildAdvisorCardTools({
      userId: 'user-1',
      turnId,
      creditCards: { readDataMode: async () => mode, ...services } as unknown as AdvisorCreditCardServices,
      deletion: new DeletionConfirmationService('test-secret'),
    });
    return tools.find((tool) => tool.name === name)!.execute(args);
  };

  beforeEach(() => {
    mode = 'manual';
    services = { list: { execute: execute() }, create: { execute: execute() }, update: { execute: execute() }, remove: { execute: execute() } };
  });

  it('exposes the four card tools', () => {
    const tools = buildAdvisorCardTools({ userId: 'u', turnId: 't', creditCards: {} as AdvisorCreditCardServices, deletion: {} as DeletionConfirmationService });

    expect(tools.map((tool) => tool.name)).toEqual(['listar_cartoes', 'cadastrar_cartao', 'editar_cartao', 'excluir_cartao']);
  });

  it('listar_cartoes returns usage of the open invoice without internal fields', async () => {
    services.list.execute.mockResolvedValue([
      { card: makeCreditCard({ id: 'a', name: 'Nubank', lastDigits: '1234', creditLimit: 2000, closingDay: 10 }), used: 500, percentage: 25, cycle: { start: '2026-10-11', end: '2026-11-10' } },
    ]);

    expect(await run('listar_cartoes')).toEqual([
      {
        id: 'a',
        nome: 'Nubank',
        final: '1234',
        limite: 2000,
        dia_fechamento: 10,
        usado_na_fatura_aberta: 500,
        percentual_usado: 25,
        fatura_aberta: { inicio: '2026-10-11', fim: '2026-11-10' },
      },
    ]);
  });

  it('cadastrar_cartao creates the card with null optionals', async () => {
    services.create.execute.mockResolvedValue({ id: 'new-1' });

    const result = await run('cadastrar_cartao', { nome: 'Inter', limite: 3000 });

    expect(result).toEqual({ status: 'cadastrado', id: 'new-1' });
    expect(services.create.execute).toHaveBeenCalledWith('user-1', { name: 'Inter', creditLimit: 3000, lastDigits: null, closingDay: null });
  });

  it('cadastrar_cartao reports validation errors to the model', async () => {
    services.create.execute.mockRejectedValue(new EntryValidationError('Final do cartão deve ter 4 dígitos'));

    expect(await run('cadastrar_cartao', { nome: 'X', limite: 1, final: '1' })).toEqual({ erro: 'Final do cartão deve ter 4 dígitos' });
  });

  it('editar_cartao sends only the informed fields', async () => {
    expect(await run('editar_cartao', { id: 'a', limite: 9000 })).toEqual({ status: 'atualizado' });
    expect(services.update.execute).toHaveBeenCalledWith('user-1', 'a', {
      name: undefined,
      creditLimit: 9000,
      lastDigits: undefined,
      closingDay: undefined,
    });
  });

  it('editar_cartao reports a card that is not the user own', async () => {
    services.update.execute.mockRejectedValue(new EntryNotFoundError('Cartão não encontrado'));

    expect(await run('editar_cartao', { id: 'ghost', nome: 'X' })).toEqual({ erro: 'Cartão não encontrado' });
  });

  it('refuses every tool in pluggy mode without touching cards', async () => {
    mode = 'pluggy';

    for (const [name, args] of [['listar_cartoes', {}], ['cadastrar_cartao', { nome: 'X', limite: 1 }], ['editar_cartao', { id: 'a', nome: 'X' }], ['excluir_cartao', { id: 'a' }]] as const) {
      expect(await run(name, args)).toEqual({ erro: PLUGGY_MODE_REFUSAL });
    }
    expect(services.list.execute).not.toHaveBeenCalled();
    expect(services.create.execute).not.toHaveBeenCalled();
    expect(services.update.execute).not.toHaveBeenCalled();
    expect(services.remove.execute).not.toHaveBeenCalled();
  });

  it('refuses before the mode is chosen', async () => {
    mode = null;

    expect(await run('listar_cartoes')).toEqual({ erro: PLUGGY_MODE_REFUSAL });
  });
});
