import { ToolDefinition } from '../../domain/models/language-model';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { AssistantMemoryRepository } from '../../domain/repositories/assistant-memory-repository';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { getCurrentMonth } from '@/lib/month';
import {
  REGISTRAR_LANCAMENTO_SCHEMA,
  DEFINIR_LIMITE_SCHEMA,
  SALVAR_MEMORIA_SCHEMA,
  RegistrarLancamentoArgs,
  DefinirLimiteArgs,
  SalvarMemoriaArgs,
} from './advisor-tool-schemas';

export type AdvisorActionDeps = {
  userId: string;
  goalRepo: GoalRepository;
  memoryRepo: AssistantMemoryRepository;
  registerEntry: RegisterManualEntryUseCase;
};

export function buildAdvisorActionTools(deps: AdvisorActionDeps): ToolDefinition[] {
  return [
    {
      name: 'registrar_lancamento',
      description: 'Registra um novo lançamento financeiro (saída, entrada ou investimento).',
      parameters: REGISTRAR_LANCAMENTO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as RegistrarLancamentoArgs;
        return deps.registerEntry.execute(deps.userId, {
          type: args.tipo,
          category: args.categoria,
          description: args.descricao,
          amount: Math.abs(Number(args.valor)),
        });
      },
    },
    {
      name: 'definir_limite_categoria',
      description: 'Define um teto ou meta de gastos para uma categoria no mês atual.',
      parameters: DEFINIR_LIMITE_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as DefinirLimiteArgs;
        const month = `${getCurrentMonth()}-01`;
        return deps.goalRepo.upsert({
          userId: deps.userId,
          month,
          category: args.categoria,
          targetAmount: Number(args.valor),
        });
      },
    },
    {
      name: 'salvar_memoria',
      description: 'Salva um fato ou preferência importante de longo prazo sobre o usuário.',
      parameters: SALVAR_MEMORIA_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as SalvarMemoriaArgs;
        return deps.memoryRepo.create({ userId: deps.userId, fact: args.fato });
      },
    },
  ];
}
