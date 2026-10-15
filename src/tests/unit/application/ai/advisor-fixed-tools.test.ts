import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildAdvisorFixedTools } from '@/modules/ai/application/tools/advisor-fixed-tools';
import type { AdvisorFixedEntryServices } from '@/modules/ai/application/tools/advisor-fixed-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';
import { EntryNotFoundError, EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';

const execute = () => vi.fn();

describe('Advisor fixed entry tools', () => {
  let services: { [K in keyof AdvisorFixedEntryServices]: { execute: ReturnType<typeof vi.fn> } };
  let deletion: DeletionConfirmationService;

  const run = (name: string, args: Record<string, unknown> = {}, turnId = 'turn-2') => {
    const tools = buildAdvisorFixedTools({
      userId: 'user-1',
      turnId,
      fixedEntries: services as unknown as AdvisorFixedEntryServices,
      deletion,
    });
    return tools.find((tool) => tool.name === name)!.execute(args);
  };

  beforeEach(() => {
    services = { list: { execute: execute() }, create: { execute: execute() }, update: { execute: execute() }, setActive: { execute: execute() }, remove: { execute: execute() } };
    deletion = new DeletionConfirmationService('test-secret');
  });

  it('exposes the five fixed entry tools', () => {
    const tools = buildAdvisorFixedTools({ userId: 'u', turnId: 't', fixedEntries: services as unknown as AdvisorFixedEntryServices, deletion });
    expect(tools.map((tool) => tool.name)).toEqual(['listar_fixos', 'cadastrar_fixo', 'editar_fixo', 'pausar_fixo', 'excluir_fixo']);
  });

  it('listar_fixos hides internals and returns the month status', async () => {
    services.list.execute.mockResolvedValue([{ ...makeFixedEntry({ id: 'net' }), dueDate: '2026-03-10', status: 'scheduled' }]);

    expect(await run('listar_fixos')).toEqual([
      { id: 'net', tipo: 'expense', descricao: 'Internet', categoria: 'Moradia', valor: 120, dia_vencimento: 10, status: 'scheduled' },
    ]);
  });

  it('cadastrar_fixo creates the rule and launches the current month by default', async () => {
    services.create.execute.mockResolvedValue({ id: 'new-1' });

    const result = await run('cadastrar_fixo', { tipo: 'income', descricao: 'Salário', categoria: 'Salário', valor: -5000, dia_vencimento: 5 });

    expect(result).toEqual({ status: 'cadastrado', id: 'new-1' });
    expect(services.create.execute).toHaveBeenCalledWith('user-1', {
      kind: 'income',
      description: 'Salário',
      category: 'Salário',
      amount: 5000,
      dueDay: 5,
      launchThisMonth: true,
    });
  });

  it('cadastrar_fixo turns validation errors into a tool error', async () => {
    services.create.execute.mockRejectedValue(new EntryValidationError('Dia de vencimento deve ficar entre 1 e 31'));

    expect(await run('cadastrar_fixo', { tipo: 'expense', descricao: 'x', categoria: 'y', valor: 1, dia_vencimento: 40 })).toEqual({
      erro: 'Dia de vencimento deve ficar entre 1 e 31',
    });
  });

  it('editar_fixo changes only from now on unless asked otherwise', async () => {
    await run('editar_fixo', { id: 'net', valor: 150 });

    expect(services.update.execute).toHaveBeenCalledWith('user-1', 'net', {
      amount: 150,
      description: undefined,
      category: undefined,
      dueDay: undefined,
      applyToCurrentMonth: false,
    });
  });

  it('pausar_fixo pauses by default and reactivates with pausado=false', async () => {
    expect(await run('pausar_fixo', { id: 'net' })).toEqual({ status: 'pausado' });
    expect(services.setActive.execute).toHaveBeenLastCalledWith('user-1', 'net', false);

    expect(await run('pausar_fixo', { id: 'net', pausado: false })).toEqual({ status: 'reativado' });
    expect(services.setActive.execute).toHaveBeenLastCalledWith('user-1', 'net', true);
  });

  it('pausar_fixo reports a rule that does not exist', async () => {
    services.setActive.execute.mockRejectedValue(new EntryNotFoundError('Lançamento fixo não encontrado'));

    expect(await run('pausar_fixo', { id: 'ghost' })).toEqual({ erro: 'Lançamento fixo não encontrado' });
  });
});
