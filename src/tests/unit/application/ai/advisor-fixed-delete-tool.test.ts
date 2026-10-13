import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildAdvisorFixedTools } from '@/modules/ai/application/tools/advisor-fixed-tools';
import type { AdvisorFixedEntryServices } from '@/modules/ai/application/tools/advisor-fixed-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';

describe('excluir_fixo two-step deletion', () => {
  const deletion = new DeletionConfirmationService('test-secret');
  const remove = vi.fn();
  const buildTool = (turnId: string) =>
    buildAdvisorFixedTools({
      userId: 'user-1',
      turnId,
      fixedEntries: { remove: { execute: remove } } as unknown as AdvisorFixedEntryServices,
      deletion,
    }).find((tool) => tool.name === 'excluir_fixo')!;

  beforeEach(() => remove.mockReset());

  it('asks for confirmation first and deletes nothing', async () => {
    const result = (await buildTool('turn-1').execute({ id: 'net' })) as { status: string; confirmacao: string };

    expect(result.status).toBe('confirmacao_necessaria');
    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes after a token from a previous turn', async () => {
    const { confirmacao } = (await buildTool('turn-1').execute({ id: 'net' })) as { confirmacao: string };

    const result = await buildTool('turn-2').execute({ id: 'net', confirmacao, tambem_do_mes: true });

    expect(result).toEqual({ status: 'excluido' });
    expect(remove).toHaveBeenCalledWith('user-1', 'net', { alsoDeleteCurrentMonth: true });
  });

  it('rejects a token issued in the same turn', async () => {
    const { confirmacao } = (await buildTool('turn-1').execute({ id: 'net' })) as { confirmacao: string };

    expect(await buildTool('turn-1').execute({ id: 'net', confirmacao })).toHaveProperty('erro');
    expect(remove).not.toHaveBeenCalled();
  });

  it('rejects a token issued for another fixed entry', async () => {
    const { confirmacao } = (await buildTool('turn-1').execute({ id: 'other' })) as { confirmacao: string };

    expect(await buildTool('turn-2').execute({ id: 'net', confirmacao })).toHaveProperty('erro');
    expect(remove).not.toHaveBeenCalled();
  });
});
