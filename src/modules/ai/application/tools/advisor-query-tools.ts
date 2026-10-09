import { ToolDefinition } from '../../domain/models/language-model';
import { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { getCurrentMonth } from '@/lib/month';
import {
  BUSCAR_LANCAMENTOS_SCHEMA,
  TOTAL_POR_CATEGORIA_SCHEMA,
  COMPARAR_PERIODOS_SCHEMA,
  BuscarLancamentosArgs,
  TotalPorCategoriaArgs,
  CompararPeriodosArgs,
} from './advisor-tool-schemas';

export type AdvisorQueryDeps = {
  userId: string;
  transactionRepo: TransactionRepository;
};

export function buildAdvisorQueryTools(deps: AdvisorQueryDeps): ToolDefinition[] {
  return [
    {
      name: 'buscar_lancamentos',
      description: 'Busca lançamentos manuais do usuário por período, tipo ou categoria. Retorna no máximo 20 itens.',
      parameters: BUSCAR_LANCAMENTOS_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = (rawArgs ?? {}) as BuscarLancamentosArgs;
        const txs = await deps.transactionRepo.findAllByUserId(deps.userId, {
          month: args.periodo,
          category: args.categoria,
          source: 'manual',
          limit: 20,
        });
        return txs.map((t) => ({ data: t.occurredAt, descricao: t.description, categoria: t.category, valor: t.amount }));
      },
    },
    {
      name: 'total_por_categoria',
      description: 'Calcula o total gasto por categoria em um período específico.',
      parameters: TOTAL_POR_CATEGORIA_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = (rawArgs ?? {}) as TotalPorCategoriaArgs;
        const txs = await deps.transactionRepo.findAllByUserId(deps.userId, {
          month: args.periodo ?? getCurrentMonth(),
          source: 'manual',
        });
        const totals: Record<string, number> = {};
        for (const t of txs) {
          const c = t.category || 'Outros';
          totals[c] = (totals[c] ?? 0) + Number(t.amount);
        }
        return totals;
      },
    },
    {
      name: 'comparar_periodos',
      description: 'Compara os gastos totais entre dois meses (YYYY-MM).',
      parameters: COMPARAR_PERIODOS_SCHEMA,
      execute: async (rawArgs: unknown) => {
        const args = rawArgs as CompararPeriodosArgs;
        const [a, b] = await Promise.all([
          deps.transactionRepo.findAllByUserId(deps.userId, { month: args.periodoA, source: 'manual' }),
          deps.transactionRepo.findAllByUserId(deps.userId, { month: args.periodoB, source: 'manual' }),
        ]);
        const sumA = a.reduce((s, t) => s + Number(t.amount), 0);
        const sumB = b.reduce((s, t) => s + Number(t.amount), 0);
        return { [args.periodoA]: sumA, [args.periodoB]: sumB, diferenca: sumB - sumA };
      },
    },
  ];
}
