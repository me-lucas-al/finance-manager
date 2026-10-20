import { ToolDefinition } from '../../domain/models/language-model';
import { EMPTY_TOTALS } from '@/modules/finance/domain/services/summarize-ledger';
import {
  BUSCAR_LANCAMENTOS_SCHEMA,
  TOTAL_POR_CATEGORIA_SCHEMA,
  COMPARAR_PERIODOS_SCHEMA,
  BuscarLancamentosArgs,
  TotalPorCategoriaArgs,
  CompararPeriodosArgs,
} from './advisor-query-schemas';
import {
  AdvisorQueryDeps,
  INVALID_MONTH,
  hasInvalidMonth,
  periodIdOrCurrent,
  periodIdStartingIn,
} from './advisor-period-arg';

export type { AdvisorQueryDeps };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

async function searchEntries(deps: AdvisorQueryDeps, args: BuscarLancamentosArgs) {
  const limit = Math.min(Math.max(Number(args.limite) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const periodId = args.periodo ? await periodIdStartingIn(deps, args.periodo) : undefined;
  if (args.periodo && !periodId) return [];
  const entries = await deps.periodLedger.search(deps.userId, {
    periodId: periodId ?? undefined,
    kind: args.tipo,
    category: args.categoria,
    text: args.texto,
    limit,
  });
  return entries.map((e) => ({ id: e.id, tipo: e.kind, data: e.date, descricao: e.description, categoria: e.category, valor: e.amount }));
}

async function totalsStartingIn(deps: AdvisorQueryDeps, month: string) {
  const periodId = await periodIdStartingIn(deps, month);
  return periodId ? deps.periodLedger.totals(deps.userId, periodId) : EMPTY_TOTALS;
}

export function buildAdvisorQueryTools(deps: AdvisorQueryDeps): ToolDefinition[] {
  return [
    {
      name: 'buscar_lancamentos',
      description:
        'Busca lançamentos (saídas, entradas e investimentos) por período, categoria, tipo ou texto. Retorna o id de cada item, necessário para editar ou excluir.',
      parameters: BUSCAR_LANCAMENTOS_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = (rawArgs ?? {}) as BuscarLancamentosArgs;
        if (hasInvalidMonth(args.periodo)) return INVALID_MONTH;
        return searchEntries(deps, args);
      },
    },
    {
      name: 'total_por_categoria',
      description: 'Calcula o total por categoria em um período (por padrão, as saídas do período atual).',
      parameters: TOTAL_POR_CATEGORIA_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = (rawArgs ?? {}) as TotalPorCategoriaArgs;
        if (hasInvalidMonth(args.periodo)) return INVALID_MONTH;
        const periodId = await periodIdOrCurrent(deps, args.periodo);
        if (!periodId) return {};
        const totals = await deps.periodLedger.totalsByCategory(deps.userId, args.tipo ?? 'expense', periodId);
        return Object.fromEntries(totals.map(({ category, total }) => [category, total]));
      },
    },
    {
      name: 'comparar_periodos',
      description:
        'Compara entradas, saídas, investimentos e resultado entre dois períodos, cada um identificado pelo mês em que começa (YYYY-MM).',
      parameters: COMPARAR_PERIODOS_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as CompararPeriodosArgs;
        if (!args.periodoA || !args.periodoB || hasInvalidMonth(args.periodoA, args.periodoB)) return INVALID_MONTH;
        const [first, second] = await Promise.all([
          totalsStartingIn(deps, args.periodoA),
          totalsStartingIn(deps, args.periodoB),
        ]);
        return {
          [args.periodoA]: first,
          [args.periodoB]: second,
          diferencaSaidas: Math.round((second.expenses - first.expenses) * 100) / 100,
        };
      },
    },
  ];
}
