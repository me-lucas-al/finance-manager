import type { ToolDefinition } from '../../domain/models/language-model';
import { runInManualMode } from './advisor-card-mode';
import { EXCLUIR_CARTAO_SCHEMA, ExcluirCartaoArgs } from './advisor-card-schemas';
import type { AdvisorCardDeps } from './advisor-card-types';

const INVALID_CONFIRMATION =
  'Confirmação inválida, expirada ou emitida nesta mesma mensagem. Peça ao usuário para confirmar a exclusão e tente de novo.';

export function buildExcluirCartaoTool(deps: AdvisorCardDeps): ToolDefinition {
  return {
    name: 'excluir_cartao',
    description:
      'Exclui um cartão em duas etapas. A primeira chamada (sem confirmacao) devolve um token; pergunte ao usuário e, somente se ele confirmar em uma nova mensagem, chame de novo com o token em confirmacao. As despesas já lançadas no cartão são mantidas, apenas sem o vínculo.',
    parameters: EXCLUIR_CARTAO_SCHEMA,
    execute: async (rawArgs: unknown) => {
      const args = rawArgs as ExcluirCartaoArgs;
      const target = { userId: deps.userId, kind: 'credit-card', id: args.id };
      return runInManualMode(deps, async () => {
        if (!args.confirmacao) {
          return {
            status: 'confirmacao_necessaria',
            confirmacao: deps.deletion.issue(target, deps.turnId),
            mensagem: 'Pergunte ao usuário se deseja mesmo excluir. Só use o token depois da confirmação dele em uma nova mensagem.',
          };
        }
        if (!deps.deletion.isConfirmed(args.confirmacao, target, deps.turnId)) return { erro: INVALID_CONFIRMATION };
        await deps.creditCards.remove.execute(deps.userId, args.id);
        return { status: 'excluido' };
      });
    },
  };
}
