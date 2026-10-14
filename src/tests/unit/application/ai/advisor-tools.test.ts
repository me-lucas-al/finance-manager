import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildAdvisorTools } from '@/modules/ai/application/tools/financial-advisor-tools';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { FakeGoalRepository } from '../open-finance/fake-goal-repository';
import { FakeSavingsGoalRepository } from '../open-finance/fake-savings-goal-repository';
import { FakeAssistantMemoryRepository } from '@/tests/fakes/fake-assistant-memory-repository';
import { sampleLedgerSource } from '@/tests/fakes/fake-ledger-source';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';
import { getCurrentMonth } from '@/lib/month';
import { EntryNotFoundError } from '@/modules/finance/domain/models/entry-errors';

type Tool = ReturnType<typeof buildAdvisorTools>[number];

describe('Advisor Tools', () => {
  let goalRepo: FakeGoalRepository;
  let memoryRepo: FakeAssistantMemoryRepository;
  let registerEntry: { execute: ReturnType<typeof vi.fn> };
  let updateEntry: { execute: ReturnType<typeof vi.fn> };
  let deleteEntry: { execute: ReturnType<typeof vi.fn> };
  let goalsUpdater: { execute: ReturnType<typeof vi.fn> };
  let tools: Tool[];
  let deletion: DeletionConfirmationService;

  const run = (name: string, args: Record<string, unknown> = {}) =>
    tools.find((tool) => tool.name === name)!.execute(args);

  beforeEach(() => {
    goalRepo = new FakeGoalRepository();
    memoryRepo = new FakeAssistantMemoryRepository();
    registerEntry = { execute: vi.fn().mockResolvedValue({ success: true }) };
    updateEntry = { execute: vi.fn().mockResolvedValue(undefined) };
    deleteEntry = { execute: vi.fn().mockResolvedValue(undefined) };
    goalsUpdater = { execute: vi.fn().mockResolvedValue('ok') };
    deletion = new DeletionConfirmationService('test-secret');

    tools = buildAdvisorTools({
      userId: 'user-1',
      ledger: new LedgerService(sampleLedgerSource),
      goalRepo,
      savingsGoalRepo: new FakeSavingsGoalRepository(),
      memoryRepo,
      registerEntry: registerEntry as unknown as RegisterManualEntryUseCase,
      updateEntry: updateEntry as unknown as UpdateEntryUseCase,
      deleteEntry: deleteEntry as unknown as DeleteEntryUseCase,
      deletion,
      turnId: 'turn-2',
      goalsUpdater,
      listCategories: async () => ['Mercado', 'Lazer'],
    });
  });

  it('provides every query, entry, goal and memory tool', () => {
    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [
        'atualizar_metas',
        'buscar_lancamentos',
        'comparar_periodos',
        'consultar_investimentos',
        'consultar_metas',
        'consultar_saldo',
        'definir_limite_categoria',
        'editar_lancamento',
        'excluir_lancamento',
        'listar_categorias',
        'registrar_lancamento',
        'salvar_memoria',
        'total_por_categoria',
      ].sort()
    );
  });

  it('searches every kind of entry and returns ids for editing', async () => {
    const result = (await run('buscar_lancamentos', { periodo: '2026-03', tipo: 'income' })) as Array<{ id: string; tipo: string }>;

    expect(result.map((item) => item.id).sort()).toEqual(['i3']);
    const investments = (await run('buscar_lancamentos', { tipo: 'investment' })) as Array<{ id: string }>;
    expect(investments.map((item) => item.id)).toEqual(['v1']);
  });

  it('reports the same balance as the dashboard ledger', async () => {
    const result = (await run('consultar_saldo')) as { saldoTotal: number; totalInvestido: number };

    expect(result.saldoTotal).toBeCloseTo(11000 - 1600.2 - 800, 2);
    expect(result.totalInvestido).toBe(800);
  });

  it('totals expenses by category for the informed month', async () => {
    expect(await run('total_por_categoria', { periodo: '2026-03' })).toEqual({ Mercado: 99.9, Outros: 300.2 });
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

  it('validates periods and limits before querying or saving', async () => {
    expect(await run('comparar_periodos', { periodoA: '2026-03' })).toHaveProperty('erro');
    expect(await run('total_por_categoria', { periodo: 'marco' })).toHaveProperty('erro');
    expect(await run('definir_limite_categoria', { categoria: 'Lazer', valor: -5 })).toHaveProperty('erro');
  });

  it('delegates free-text goals to the goals updater and lists categories', async () => {
    expect(await run('atualizar_metas', { mensagem: 'teto de 3000' })).toBe('ok');
    expect(goalsUpdater.execute).toHaveBeenCalledWith('user-1', 'teto de 3000');
    expect(await run('listar_categorias')).toEqual({ categorias: ['Mercado', 'Lazer'] });
  });

  it('stores memory facts and category limits', async () => {
    await run('salvar_memoria', { fato: 'O usuário quer juntar 10k para viajar no fim do ano' });
    await run('definir_limite_categoria', { categoria: 'Delivery', valor: 400 });

    expect((await memoryRepo.findAllByUserId('user-1'))[0].fact).toContain('10k');
    const goals = await goalRepo.findAllByUserIdAndMonth('user-1', `${getCurrentMonth()}-01`);
    expect(goals.some((goal) => goal.category === 'Delivery' && goal.targetAmount === 400)).toBe(true);
  });
});
