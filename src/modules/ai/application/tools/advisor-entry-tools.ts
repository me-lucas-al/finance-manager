import { ToolDefinition } from '../../domain/models/language-model';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { reportFailure } from './advisor-failure-reporter';
import { DeletionConfirmationService } from '../services/deletion-confirmation-service';
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
  deletion: DeletionConfirmationService;
  turnId: string;
};

const INVALID_CONFIRMATION =
  "Confirmação inválida, expirada ou emitida nesta mesma mensagem. Peça ao usuário para confirmar a exclusão e tente de novo.";

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
        'Exclui um lançamento em duas etapas. A primeira chamada (sem confirmacao) devolve um token; pergunte ao usuário e, somente se ele confirmar em uma nova mensagem, chame de novo com o token em confirmacao.',
      parameters: EXCLUIR_LANCAMENTO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as ExcluirLancamentoArgs;
        const target = { userId: deps.userId, kind: args.tipo, id: args.id };
        if (!args.confirmacao) {
          return {
            status: 'confirmacao_necessaria',
            confirmacao: deps.deletion.issue(target, deps.turnId),
            mensagem: 'Pergunte ao usuário se deseja mesmo excluir. Só use o token depois da confirmação dele em uma nova mensagem.',
          };
        }
        if (!deps.deletion.isConfirmed(args.confirmacao, target, deps.turnId)) return { erro: INVALID_CONFIRMATION };
        return reportFailure(async () => {
          await deps.deleteEntry.execute(deps.userId, { kind: args.tipo, id: args.id });
          return { status: 'excluido' };
        });
      },
    },
  ];
}
