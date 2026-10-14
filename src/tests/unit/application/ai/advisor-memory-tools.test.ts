import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrentMonth } from '@/lib/month';
import { createAdvisorToolsHarness } from '@/tests/fakes/advisor-tools-harness';

type Harness = ReturnType<typeof createAdvisorToolsHarness>;

describe('Advisor goal and memory tools', () => {
  let run: Harness['run'];
  let goalRepo: Harness['goalRepo'];
  let memoryRepo: Harness['memoryRepo'];
  let goalsUpdater: Harness['goalsUpdater'];

  beforeEach(() => {
    ({ run, goalRepo, memoryRepo, goalsUpdater } = createAdvisorToolsHarness());
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
