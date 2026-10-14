import { describe, it, expect, beforeEach } from 'vitest';
import { EntryNotFoundError } from '@/modules/finance/domain/models/entry-errors';
import { createAdvisorToolsHarness } from '@/tests/fakes/advisor-tools-harness';

type Harness = ReturnType<typeof createAdvisorToolsHarness>;

describe('Advisor entry tools', () => {
  let run: Harness['run'];
  let registerEntry: Harness['registerEntry'];
  let updateEntry: Harness['updateEntry'];
  let deleteEntry: Harness['deleteEntry'];
  let deletion: Harness['deletion'];

  beforeEach(() => {
    ({ run, registerEntry, updateEntry, deleteEntry, deletion } = createAdvisorToolsHarness());
  });

  it('registers entries with the informed date', async () => {
    await run('registrar_lancamento', { tipo: 'expense', categoria: 'Lazer', descricao: 'Cinema', valor: 40, data: '2026-03-01' });

    expect(registerEntry.execute).toHaveBeenCalledWith('user-1', {
      type: 'expense',
      category: 'Lazer',
      description: 'Cinema',
      amount: 40,
      date: '2026-03-01',
    });
  });

  it('edits an entry and reports failures to the model instead of throwing', async () => {
    await run('editar_lancamento', { id: 'e1', tipo: 'expense', valor: 10 });
    expect(updateEntry.execute).toHaveBeenCalledWith('user-1', { kind: 'expense', id: 'e1' }, expect.objectContaining({ amount: 10 }));

    updateEntry.execute.mockRejectedValueOnce(new EntryNotFoundError());
    expect(await run('editar_lancamento', { id: 'x', tipo: 'expense', valor: 10 })).toEqual({ erro: 'Lançamento não encontrado' });
  });

  it('only deletes with a token issued in an earlier turn', async () => {
    const pending = (await run('excluir_lancamento', { id: 'e1', tipo: 'expense' })) as { status: string; confirmacao: string };
    expect(pending.status).toBe('confirmacao_necessaria');
    expect(deleteEntry.execute).not.toHaveBeenCalled();

    const sameTurn = await run('excluir_lancamento', { id: 'e1', tipo: 'expense', confirmacao: pending.confirmacao });
    expect(sameTurn).toHaveProperty('erro');
    expect(deleteEntry.execute).not.toHaveBeenCalled();

    const earlierTurnToken = deletion.issue({ userId: 'user-1', kind: 'expense', id: 'e1' }, 'turn-1');
    expect(await run('excluir_lancamento', { id: 'e1', tipo: 'expense', confirmacao: earlierTurnToken })).toEqual({ status: 'excluido' });
    expect(deleteEntry.execute).toHaveBeenCalledWith('user-1', { kind: 'expense', id: 'e1' });
  });

  it('rejects tokens for another entry', async () => {
    const token = deletion.issue({ userId: 'user-1', kind: 'expense', id: 'e1' }, 'turn-1');

    expect(await run('excluir_lancamento', { id: 'e2', tipo: 'expense', confirmacao: token })).toHaveProperty('erro');
    expect(deleteEntry.execute).not.toHaveBeenCalled();
  });
});
