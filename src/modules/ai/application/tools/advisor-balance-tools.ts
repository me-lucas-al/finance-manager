import { ToolDefinition } from '../../domain/models/language-model';
import type { PeriodLedgerService } from '@/modules/finance/application/services/period-ledger-service';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { bankBalanceFromTotals, investedTotalFromTotals } from '@/modules/finance/domain/services/portfolio-totals';
import { SEM_PARAMETROS_SCHEMA } from './advisor-query-schemas';
import { buildInvestmentsTool } from './advisor-investments-tool';

export type AdvisorBalanceDeps = {
  userId: string;
  periodLedger: PeriodLedgerService;
  portfolio: PortfolioService;
};

export function buildAdvisorBalanceTools(deps: AdvisorBalanceDeps): ToolDefinition[] {
  return [
    {
      name: 'consultar_saldo',
      description:
        'Retorna o saldo atual em conta, o patrimônio investido e os totais do período atual. Use para qualquer pergunta sobre quanto o usuário tem.',
      parameters: SEM_PARAMETROS_SCHEMA,
      execute: async () => {
        const window = await deps.periodLedger.currentWindow(deps.userId);
        const [allTime, current, portfolio] = await Promise.all([
          deps.periodLedger.totals(deps.userId),
          deps.periodLedger.totals(deps.userId, window.id),
          deps.portfolio.load(deps.userId),
        ]);
        return {
          saldoTotal: bankBalanceFromTotals(allTime, portfolio),
          totalInvestido: investedTotalFromTotals(allTime, portfolio),
          periodoAtual: current,
        };
      },
    },
    buildInvestmentsTool(deps),
  ];
}
