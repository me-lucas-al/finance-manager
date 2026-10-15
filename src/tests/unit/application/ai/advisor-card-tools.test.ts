import { describe, it, expect, beforeEach } from 'vitest';
import { buildAdvisorCardTools } from '@/modules/ai/application/tools/advisor-card-tools';
import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';
import { EntryNotFoundError, EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import { createCardToolsHarness } from '@/tests/fakes/advisor-card-tools-harness';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

describe('Advisor credit card tools', () => {
  let harness: ReturnType<typeof createCardToolsHarness>;

  beforeEach(() => {
    harness = createCardToolsHarness();
  });

  it('exposes the four card tools', () => {
    const tools = buildAdvisorCardTools({ userId: 'u', turnId: 't', creditCards: {} as AdvisorCreditCardServices, deletion: {} as DeletionConfirmationService });

    expect(tools.map((tool) => tool.name)).toEqual(['listar_cartoes', 'cadastrar_cartao', 'editar_cartao', 'excluir_cartao']);
  });

  it('listar_cartoes returns usage of the open invoice without internal fields', async () => {
    harness.services.list.execute.mockResolvedValue([
      { card: makeCreditCard({ id: 'a', name: 'Nubank', lastDigits: '1234', creditLimit: 2000, closingDay: 10 }), used: 500, percentage: 25, cycle: { start: '2026-10-11', end: '2026-11-10' } },
    ]);

    expect(await harness.run('listar_cartoes')).toEqual([
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
    harness.services.create.execute.mockResolvedValue({ id: 'new-1' });

    const result = await harness.run('cadastrar_cartao', { nome: 'Inter', limite: 3000 });

    expect(result).toEqual({ status: 'cadastrado', id: 'new-1' });
    expect(harness.services.create.execute).toHaveBeenCalledWith('user-1', { name: 'Inter', creditLimit: 3000, lastDigits: null, closingDay: null });
  });

  it('cadastrar_cartao reports validation errors to the model', async () => {
    harness.services.create.execute.mockRejectedValue(new EntryValidationError('Final do cartão deve ter 4 dígitos'));

    expect(await harness.run('cadastrar_cartao', { nome: 'X', limite: 1, final: '1' })).toEqual({ erro: 'Final do cartão deve ter 4 dígitos' });
  });

  it('editar_cartao reports a card that is not the user own', async () => {
    harness.services.update.execute.mockRejectedValue(new EntryNotFoundError('Cartão não encontrado'));

    expect(await harness.run('editar_cartao', { id: 'ghost', nome: 'X' })).toEqual({ erro: 'Cartão não encontrado' });
  });
});
