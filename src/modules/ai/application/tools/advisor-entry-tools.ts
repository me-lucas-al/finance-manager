import { ToolDefinition } from '../../domain/models/language-model';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import {
  REGISTRAR_LANCAMENTO_SCHEMA,
  EDITAR_LANCAMENTO_SCHEMA,
  EXCLUIR_LANCAMENTO_SCHEMA,
  RegistrarLancamentoArgs,
  EditarLancamentoArgs,
  ExcluirLancamentoArgs,
} from './advisor-entry-schemas';

export type AdvisorEntryDeps = {
  userId: string;
  registerEntry: RegisterManualEntryUseCase;
  updateEntry: UpdateEntryUseCase;
  deleteEntry: DeleteEntryUseCase;
};

async function reportFailure<T>(action: () => Promise<T>): Promise<T | { erro: string }> {
  try {
    return await action();
  } catch (error) {
    return { erro: error instanceof Error ? error.message : 'Falha ao processar o lançamento' };
  }
}

export function buildAdvisorEntryTools(deps: AdvisorEntryDeps): ToolDefinition[] {
  return [
    {
      name: 'registrar_lancamento',
      description:
        'Registra um novo lançamento financeiro (saída, entrada ou investimento). Informe a data (YYYY-MM-DD) quando o usuário citar um dia diferente de hoje.',
      parameters: REGISTRAR_LANCAMENTO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as RegistrarLancamentoArgs;
        return reportFailure(() =>
          deps.registerEntry.execute(deps.userId, {
            type: args.tipo,
            category: args.categoria,
            description: args.descricao,
            amount: Math.abs(Number(args.valor)),
            ...(args.data ? { date: args.data } : {}),
          })
        );
      },
    },
    {
      name: 'editar_lancamento',
      description:
        'Altera valor, descrição, categoria ou data de um lançamento existente. Use buscar_lancamentos antes para obter o id.',
      parameters: EDITAR_LANCAMENTO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as EditarLancamentoArgs;
        return reportFailure(async () => {
          await deps.updateEntry.execute(
            deps.userId,
            { kind: args.tipo, id: args.id },
            { amount: args.valor, description: args.descricao, category: args.categoria, date: args.data }
          );
          return { status: 'atualizado' };
        });
      },
    },
    {
      name: 'excluir_lancamento',
      description:
        'Exclui um lançamento. Só chame com confirmado=true depois que o usuário confirmar explicitamente; sem confirmação a exclusão não acontece.',
      parameters: EXCLUIR_LANCAMENTO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as ExcluirLancamentoArgs;
        if (args.confirmado !== true) {
          return { status: 'confirmacao_necessaria', mensagem: 'Peça ao usuário para confirmar a exclusão antes de continuar.' };
        }
        return reportFailure(async () => {
          await deps.deleteEntry.execute(deps.userId, { kind: args.tipo, id: args.id });
          return { status: 'excluido' };
        });
      },
    },
  ];
}
