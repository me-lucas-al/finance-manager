import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildAdvisorTools } from '@/modules/ai/application/tools/financial-advisor-tools';
import { FakeTransactionRepository } from '../open-finance/fake-transaction-repository';
import { FakeGoalRepository } from '../open-finance/fake-goal-repository';
import { FakeAssistantMemoryRepository } from '@/tests/fakes/fake-assistant-memory-repository';

import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';

describe('Advisor Tools', () => {
  let transactionRepo: FakeTransactionRepository;
  let goalRepo: FakeGoalRepository;
  let memoryRepo: FakeAssistantMemoryRepository;
  let registerEntry: { execute: ReturnType<typeof vi.fn> };
  let tools: ReturnType<typeof buildAdvisorTools>;

  beforeEach(() => {
    transactionRepo = new FakeTransactionRepository();
    goalRepo = new FakeGoalRepository();
    memoryRepo = new FakeAssistantMemoryRepository();
    registerEntry = { execute: vi.fn().mockResolvedValue({ success: true }) };

    tools = buildAdvisorTools({
      userId: 'user-1',
      transactionRepo,
      goalRepo,
      memoryRepo,
      registerEntry: registerEntry as unknown as RegisterManualEntryUseCase,
    });
  });

  it('provides all required tools', () => {
    const names = tools.map((t) => t.name);
    expect(names).toContain('buscar_lancamentos');
    expect(names).toContain('total_por_categoria');
    expect(names).toContain('comparar_periodos');
    expect(names).toContain('registrar_lancamento');
    expect(names).toContain('definir_limite_categoria');
    expect(names).toContain('salvar_memoria');
  });

  it('executes registrar_lancamento via registerEntry usecase', async () => {
    const tool = tools.find((t) => t.name === 'registrar_lancamento')!;
    await tool.execute({ tipo: 'expense', categoria: 'Lazer', descricao: 'Cinema', valor: 40 });
    expect(registerEntry.execute).toHaveBeenCalledWith('user-1', {
      type: 'expense',
      category: 'Lazer',
      description: 'Cinema',
      amount: 40,
    });
  });

  it('executes salvar_memoria in memory repository', async () => {
    const tool = tools.find((t) => t.name === 'salvar_memoria')!;
    await tool.execute({ fato: 'O usuário quer juntar 10k para viajar no fim do ano' });
    const facts = await memoryRepo.findAllByUserId('user-1');
    expect(facts).toHaveLength(1);
    expect(facts[0].fact).toContain('10k');
  });

  it('executes definir_limite_categoria in goal repository', async () => {
    const tool = tools.find((t) => t.name === 'definir_limite_categoria')!;
    await tool.execute({ categoria: 'Delivery', valor: 400 });
    const goals = await goalRepo.findAllByUserIdAndMonth('user-1', `${new Date().toISOString().slice(0, 7)}-01`);
    expect(goals.some((g) => g.category === 'Delivery' && g.targetAmount === 400)).toBe(true);
  });
});
