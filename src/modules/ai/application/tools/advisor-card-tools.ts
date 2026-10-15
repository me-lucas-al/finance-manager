import type { ToolDefinition } from '../../domain/models/language-model';
import { runInManualMode } from './advisor-card-mode';
import { buildExcluirCartaoTool } from './advisor-card-delete-tool';
import {
  CADASTRAR_CARTAO_SCHEMA,
  EDITAR_CARTAO_SCHEMA,
  LISTAR_CARTOES_SCHEMA,
  CadastrarCartaoArgs,
  EditarCartaoArgs,
} from './advisor-card-schemas';
import type { AdvisorCardDeps } from './advisor-card-types';

export function buildAdvisorCardTools(deps: AdvisorCardDeps): ToolDefinition[] {
  const { userId, creditCards } = deps;
  return [
    {
      name: 'listar_cartoes',
      description:
        'Lista os cartões de crédito cadastrados com limite, dia de fechamento e quanto da fatura aberta já foi usado. Use sempre que o usuário falar de cartão, fatura ou crédito e o cartão não estiver claro.',
      parameters: LISTAR_CARTOES_SCHEMA,
      execute: () =>
        runInManualMode(deps, async () =>
          (await creditCards.list.execute(userId)).map(({ card, used, percentage, cycle }) => ({
            id: card.id,
            nome: card.name,
            final: card.lastDigits,
            limite: card.creditLimit,
            dia_fechamento: card.closingDay,
            usado_na_fatura_aberta: used,
            percentual_usado: percentage,
            fatura_aberta: { inicio: cycle.start, fim: cycle.end },
          }))
        ),
    },
    {
      name: 'cadastrar_cartao',
      description:
        'Cadastra um cartão de crédito. Peça ao usuário ao menos o nome e o limite; final (4 dígitos) e dia de fechamento são opcionais.',
      parameters: CADASTRAR_CARTAO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as CadastrarCartaoArgs;
        return runInManualMode(deps, async () => {
          const card = await creditCards.create.execute(userId, {
            name: args.nome,
            creditLimit: Number(args.limite),
            lastDigits: args.final ?? null,
            closingDay: args.dia_fechamento ?? null,
          });
          return { status: 'cadastrado', id: card.id };
        });
      },
    },
    {
      name: 'editar_cartao',
      description: 'Altera nome, limite, final ou dia de fechamento de um cartão. Use listar_cartoes antes para obter o id.',
      parameters: EDITAR_CARTAO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as EditarCartaoArgs;
        return runInManualMode(deps, async () => {
          await creditCards.update.execute(userId, args.id, {
            name: args.nome,
            creditLimit: args.limite,
            lastDigits: args.final === '' ? null : args.final,
            closingDay: args.dia_fechamento === 0 ? null : args.dia_fechamento,
          });
          return { status: 'atualizado' };
        });
      },
    },
    buildExcluirCartaoTool(deps),
  ];
}
