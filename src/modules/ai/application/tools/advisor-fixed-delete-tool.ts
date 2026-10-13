import type { ToolDefinition } from '../../domain/models/language-model';
import { reportFailure } from './advisor-failure-reporter';
import { EXCLUIR_FIXO_SCHEMA, ExcluirFixoArgs } from './advisor-fixed-schemas';
import type { AdvisorFixedDeps } from './advisor-fixed-types';

const INVALID_CONFIRMATION =
  'Confirmação inválida, expirada ou emitida nesta mesma mensagem. Peça ao usuário para confirmar a exclusão e tente de novo.';

export function buildExcluirFixoTool(deps: AdvisorFixedDeps): ToolDefinition {
  return {
    name: 'excluir_fixo',
    description:
      'Exclui um lançamento fixo em duas etapas. A primeira chamada (sem confirmacao) devolve um token; pergunte ao usuário e, somente se ele confirmar em uma nova mensagem, chame de novo com o token em confirmacao. Os lançamentos já gerados são mantidos, salvo tambem_do_mes.',
    parameters: EXCLUIR_FIXO_SCHEMA,
    execute: async (rawArgs: unknown) => {
      const args = rawArgs as ExcluirFixoArgs;
      const target = { userId: deps.userId, kind: 'fixed', id: args.id };
      if (!args.confirmacao) {
        return {
          status: 'confirmacao_necessaria',
          confirmacao: deps.deletion.issue(target, deps.turnId),
          mensagem: 'Pergunte ao usuário se deseja mesmo excluir. Só use o token depois da confirmação dele em uma nova mensagem.',
        };
      }
      if (!deps.deletion.isConfirmed(args.confirmacao, target, deps.turnId)) return { erro: INVALID_CONFIRMATION };
      return reportFailure(async () => {
        await deps.fixedEntries.remove.execute(deps.userId, args.id, {
          alsoDeleteCurrentMonth: args.tambem_do_mes ?? false,
        });
        return { status: 'excluido' };
      });
    },
  };
}
