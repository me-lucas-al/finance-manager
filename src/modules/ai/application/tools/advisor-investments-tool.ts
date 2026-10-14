import { ToolDefinition } from '../../domain/models/language-model';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { computeInvestmentTotal } from '@/modules/finance/domain/services/compute-investment-total';
import { entriesOfKind, totalsByCategory } from '@/modules/finance/domain/services/summarize-ledger';
import { SEM_PARAMETROS_SCHEMA } from './advisor-query-schemas';

type Deps = { userId: string; ledger: LedgerService; portfolio: PortfolioService };

export function buildInvestmentsTool(deps: Deps): ToolDefinition {
  return {
    name: 'consultar_investimentos',
    description: 'Lista os investimentos do usuário, com patrimônio total, posições sincronizadas e aportes por tipo.',
    parameters: SEM_PARAMETROS_SCHEMA,
    execute: async () => {
      const [entries, portfolio] = await Promise.all([deps.ledger.load(deps.userId), deps.portfolio.load(deps.userId)]);
      const investments = entriesOfKind(entries, 'investment');
      return {
        total: computeInvestmentTotal(entries, portfolio),
        posicoes: portfolio.holdings.map((h) => ({ nome: h.name, tipo: h.type, saldo: h.balance })),
        porTipo: totalsByCategory(investments, 'investment'),
        itens: investments.map((e) => ({ id: e.id, data: e.date, descricao: e.description, tipo: e.category, valor: e.amount })),
      };
    },
  };
}
