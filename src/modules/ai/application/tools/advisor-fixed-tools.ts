import type { ToolDefinition } from '../../domain/models/language-model';
import { reportFailure } from './advisor-failure-reporter';
import { buildExcluirFixoTool } from './advisor-fixed-delete-tool';
import {
  CADASTRAR_FIXO_SCHEMA,
  EDITAR_FIXO_SCHEMA,
  LISTAR_FIXOS_SCHEMA,
  PAUSAR_FIXO_SCHEMA,
  CadastrarFixoArgs,
  EditarFixoArgs,
  PausarFixoArgs,
} from './advisor-fixed-schemas';
import type { AdvisorFixedDeps } from './advisor-fixed-types';

export function buildAdvisorFixedTools(deps: AdvisorFixedDeps): ToolDefinition[] {
  const { userId, fixedEntries } = deps;
  return [
    {
      name: 'listar_fixos',
      description: 'Lista os lançamentos fixos (despesas e receitas mensais automáticas) com o status do mês atual.',
      parameters: LISTAR_FIXOS_SCHEMA,
      execute: () =>
        reportFailure(async () =>
          (await fixedEntries.list.execute(userId)).map((view) => ({
            id: view.id,
            tipo: view.kind,
            descricao: view.description,
            categoria: view.category,
            valor: view.amount,
            dia_vencimento: view.dueDay,
            status: view.status,
          }))
        ),
    },
    {
      name: 'cadastrar_fixo',
      description:
        'Cadastra um lançamento fixo mensal, lançado sozinho no dia do vencimento. Ex.: "assino Netflix 39,90 todo dia 5" (despesa) ou "salário 5000 todo dia 5" (receita).',
      parameters: CADASTRAR_FIXO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as CadastrarFixoArgs;
        return reportFailure(async () => {
          const rule = await fixedEntries.create.execute(userId, {
            kind: args.tipo,
            description: args.descricao,
            category: args.categoria,
            amount: Math.abs(Number(args.valor)),
            dueDay: Number(args.dia_vencimento),
            launchThisMonth: args.lancar_neste_mes ?? true,
          });
          return { status: 'cadastrado', id: rule.id };
        });
      },
    },
    {
      name: 'editar_fixo',
      description:
        'Altera valor, descrição, categoria ou dia de vencimento de um fixo. Vale daqui para frente; use aplicar_ao_mes_atual para mudar também o lançamento deste mês. Use listar_fixos antes para obter o id.',
      parameters: EDITAR_FIXO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as EditarFixoArgs;
        return reportFailure(async () => {
          await fixedEntries.update.execute(userId, args.id, {
            amount: args.valor,
            description: args.descricao,
            category: args.categoria,
            dueDay: args.dia_vencimento,
            applyToCurrentMonth: args.aplicar_ao_mes_atual ?? false,
          });
          return { status: 'atualizado' };
        });
      },
    },
    {
      name: 'pausar_fixo',
      description: 'Pausa (ou reativa, com pausado=false) um lançamento fixo. Pausado não lança nada até ser reativado.',
      parameters: PAUSAR_FIXO_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as PausarFixoArgs;
        const paused = args.pausado ?? true;
        return reportFailure(async () => {
          await fixedEntries.setActive.execute(userId, args.id, !paused);
          return { status: paused ? 'pausado' : 'reativado' };
        });
      },
    },
    buildExcluirFixoTool(deps),
  ];
}
