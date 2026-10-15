import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildExcluirCartaoTool } from '@/modules/ai/application/tools/advisor-card-delete-tool';
import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';

describe('excluir_cartao two-step deletion', () => {
  const deletion = new DeletionConfirmationService('test-secret');
  const remove = vi.fn();
  const buildTool = (turnId: string, userId = 'user-1') =>
    buildExcluirCartaoTool({
      userId,
      turnId,
      creditCards: { readDataMode: async () => 'manual', remove: { execute: remove } } as unknown as AdvisorCreditCardServices,
      deletion,
    });

  beforeEach(() => remove.mockReset());

  it('asks for confirmation first and deletes nothing', async () => {
    const result = (await buildTool('turn-1').execute({ id: 'a' })) as { status: string; confirmacao: string };

    expect(result.status).toBe('confirmacao_necessaria');
    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes after a token from a previous turn', async () => {
    const { confirmacao } = (await buildTool('turn-1').execute({ id: 'a' })) as { confirmacao: string };

    expect(await buildTool('turn-2').execute({ id: 'a', confirmacao })).toEqual({ status: 'excluido' });
    expect(remove).toHaveBeenCalledWith('user-1', 'a');
  });

  it('rejects a token issued in the same turn', async () => {
    const { confirmacao } = (await buildTool('turn-1').execute({ id: 'a' })) as { confirmacao: string };

    expect(await buildTool('turn-1').execute({ id: 'a', confirmacao })).toHaveProperty('erro');
    expect(remove).not.toHaveBeenCalled();
  });

  it('rejects a token issued for another card or another user', async () => {
    const { confirmacao } = (await buildTool('turn-1').execute({ id: 'other' })) as { confirmacao: string };

    expect(await buildTool('turn-2').execute({ id: 'a', confirmacao })).toHaveProperty('erro');
    expect(await buildTool('turn-2', 'intruder').execute({ id: 'other', confirmacao })).toHaveProperty('erro');
    expect(remove).not.toHaveBeenCalled();
  });
});
