import { ToolDefinition } from '../../domain/models/language-model';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { entriesInMonth, totalsByCategory, totalsOf } from '@/modules/finance/domain/services/summarize-ledger';
import { getCurrentMonth } from '@/lib/month';
import { isValidMonthKey } from '@/modules/finance/domain/parsers/parse-entry-date';
import {
  BUSCAR_LANCAMENTOS_SCHEMA,
  TOTAL_POR_CATEGORIA_SCHEMA,
  COMPARAR_PERIODOS_SCHEMA,
  BuscarLancamentosArgs,
  TotalPorCategoriaArgs,
  CompararPeriodosArgs,
} from './advisor-query-schemas';

export type AdvisorQueryDeps = {
  userId: string;
  ledger: LedgerService;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const INVALID_MONTH = { erro: 'Período deve estar no formato YYYY-MM' };

const hasInvalidMonth = (...months: Array<string | undefined>): boolean =>
  months.some((month) => month !== undefined && !isValidMonthKey(month));

const sameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

function matchesSearch(entry: LedgerEntry, args: BuscarLancamentosArgs): boolean {
  if (args.periodo && entry.date.slice(0, 7) !== args.periodo) return false;
  if (args.tipo && entry.kind !== args.tipo) return false;
  if (args.categoria && !sameText(entry.category, args.categoria)) return false;
  if (args.texto && !entry.description.toLowerCase().includes(args.texto.toLowerCase())) return false;
  return true;
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
        const limit = Math.min(Math.max(Number(args.limite) || DEFAULT_LIMIT, 1), MAX_LIMIT);
        const entries = await deps.ledger.load(deps.userId);
        return entries
          .filter((entry) => matchesSearch(entry, args))
          .slice(0, limit)
          .map((e) => ({ id: e.id, tipo: e.kind, data: e.date, descricao: e.description, categoria: e.category, valor: e.amount }));
      },
    },
    {
      name: 'total_por_categoria',
      description: 'Calcula o total por categoria em um mês (por padrão, as saídas do mês atual).',
      parameters: TOTAL_POR_CATEGORIA_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = (rawArgs ?? {}) as TotalPorCategoriaArgs;
        if (hasInvalidMonth(args.periodo)) return INVALID_MONTH;
        const entries = await deps.ledger.load(deps.userId);
        const month = entriesInMonth(entries, args.periodo ?? getCurrentMonth());
        return Object.fromEntries(
          totalsByCategory(month, args.tipo ?? 'expense').map(({ category, total }) => [category, total])
        );
      },
    },
    {
      name: 'comparar_periodos',
      description: 'Compara entradas, saídas, investimentos e resultado entre dois meses (YYYY-MM).',
      parameters: COMPARAR_PERIODOS_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as CompararPeriodosArgs;
        if (!args.periodoA || !args.periodoB || hasInvalidMonth(args.periodoA, args.periodoB)) return INVALID_MONTH;
        const entries = await deps.ledger.load(deps.userId);
        const first = totalsOf(entriesInMonth(entries, args.periodoA));
        const second = totalsOf(entriesInMonth(entries, args.periodoB));
        return {
          [args.periodoA]: first,
          [args.periodoB]: second,
          diferencaSaidas: Math.round((second.expenses - first.expenses) * 100) / 100,
        };
      },
    },
  ];
}
