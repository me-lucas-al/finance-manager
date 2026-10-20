import { ToolDefinition } from '../../domain/models/language-model';
import type { PeriodLedgerService } from '@/modules/finance/application/services/period-ledger-service';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { investedTotalFromTotals } from '@/modules/finance/domain/services/portfolio-totals';
import { SEM_PARAMETROS_SCHEMA } from './advisor-query-schemas';

type Deps = { userId: string; periodLedger: PeriodLedgerService; portfolio: PortfolioService };

const MAX_CONTRIBUTIONS = 50;

async function contributionsOf(deps: Deps, hasHoldings: boolean) {
  if (hasHoldings) return { porTipo: [], itens: [] };
  const [byType, entries] = await Promise.all([
    deps.periodLedger.totalsByCategory(deps.userId, 'investment'),
    deps.periodLedger.search(deps.userId, { kind: 'investment', limit: MAX_CONTRIBUTIONS }),
  ]);
  return {
    porTipo: byType,
    itens: entries.map((e) => ({ id: e.id, data: e.date, descricao: e.description, tipo: e.category, valor: e.amount })),
  };
}

export function buildInvestmentsTool(deps: Deps): ToolDefinition {
  return {
    name: 'consultar_investimentos',
    description: 'Lista os investimentos do usuário, com patrimônio total, posições sincronizadas e aportes por tipo.',
    parameters: SEM_PARAMETROS_SCHEMA,
    execute: async () => {
      const [allTime, portfolio] = await Promise.all([
        deps.periodLedger.totals(deps.userId),
        deps.portfolio.load(deps.userId),
      ]);
      const contributions = await contributionsOf(deps, portfolio.holdings.length > 0);
      return {
        total: investedTotalFromTotals(allTime, portfolio),
        posicoes: portfolio.holdings.map((h) => ({ nome: h.name, tipo: h.type, saldo: h.balance })),
        ...contributions,
      };
    },
  };
}
