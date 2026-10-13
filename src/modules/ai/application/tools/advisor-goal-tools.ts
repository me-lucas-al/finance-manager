import { ToolDefinition } from '../../domain/models/language-model';
import type { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import type { SavingsGoalRepository } from '@/modules/open-finance/domain/repositories/savings-goal-repository';
import { getCurrentMonth } from '@/lib/month';
import { SEM_PARAMETROS_SCHEMA } from './advisor-query-schemas';
import { ATUALIZAR_METAS_SCHEMA, AtualizarMetasArgs } from './advisor-tool-schemas';

export interface GoalsMessageUpdater {
  execute(userId: string, message: string): Promise<string>;
}

export type AdvisorGoalDeps = {
  userId: string;
  goalRepo: GoalRepository;
  savingsGoalRepo: SavingsGoalRepository;
  goalsUpdater: GoalsMessageUpdater;
  listCategories: (userId: string) => Promise<string[]>;
};

export function buildAdvisorGoalTools(deps: AdvisorGoalDeps): ToolDefinition[] {
  return [
    {
      name: 'consultar_metas',
      description: 'Lista os tetos de gasto do mês atual (geral e por categoria) e as metas de economia ativas.',
      parameters: SEM_PARAMETROS_SCHEMA,
      execute: async () => {
        const [spendingGoals, savingsGoals] = await Promise.all([
          deps.goalRepo.findAllByUserIdAndMonth(deps.userId, `${getCurrentMonth()}-01`),
          deps.savingsGoalRepo.findAllActiveByUserId(deps.userId),
        ]);
        return { spendingGoals, savingsGoals };
      },
    },
    {
      name: 'listar_categorias',
      description: 'Lista as categorias de despesa válidas cadastradas pelo usuário.',
      parameters: SEM_PARAMETROS_SCHEMA,
      execute: async () => ({ categorias: await deps.listCategories(deps.userId) }),
    },
    {
      name: 'atualizar_metas',
      description: 'Cria ou atualiza tetos de gasto mensais e metas de economia a partir do pedido do usuário em linguagem natural.',
      parameters: ATUALIZAR_METAS_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as AtualizarMetasArgs;
        return deps.goalsUpdater.execute(deps.userId, args.mensagem);
      },
    },
  ];
}
