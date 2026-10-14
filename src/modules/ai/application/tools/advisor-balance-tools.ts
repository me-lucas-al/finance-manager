import { ToolDefinition } from '../../domain/models/language-model';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { computeBankBalance } from '@/modules/finance/domain/services/compute-bank-balance';
import { computeInvestmentTotal } from '@/modules/finance/domain/services/compute-investment-total';
import { entriesInMonth, totalsOf } from '@/modules/finance/domain/services/summarize-ledger';
import { getCurrentMonth } from '@/lib/month';
import { SEM_PARAMETROS_SCHEMA } from './advisor-query-schemas';
import { buildInvestmentsTool } from './advisor-investments-tool';

export type AdvisorBalanceDeps = {
  userId: string;
  ledger: LedgerService;
  portfolio: PortfolioService;
};

export function buildAdvisorBalanceTools(deps: AdvisorBalanceDeps): ToolDefinition[] {
  return [
    {
      name: 'consultar_saldo',
      description:
        'Retorna o saldo atual em conta, o patrimônio investido e os totais do mês atual. Use para qualquer pergunta sobre quanto o usuário tem.',
      parameters: SEM_PARAMETROS_SCHEMA,
      execute: async () => {
        const [entries, portfolio] = await Promise.all([deps.ledger.load(deps.userId), deps.portfolio.load(deps.userId)]);
        return {
          saldoTotal: computeBankBalance(entries, portfolio),
          totalInvestido: computeInvestmentTotal(entries, portfolio),
          mesAtual: totalsOf(entriesInMonth(entries, getCurrentMonth())),
        };
      },
    },
    buildInvestmentsTool(deps),
  ];
}
