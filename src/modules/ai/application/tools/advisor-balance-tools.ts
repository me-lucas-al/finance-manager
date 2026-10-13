import { ToolDefinition } from '../../domain/models/language-model';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import {
  entriesInMonth,
  entriesOfKind,
  totalsByCategory,
  totalsOf,
} from '@/modules/finance/domain/services/summarize-ledger';
import { getCurrentMonth } from '@/lib/month';
import { SEM_PARAMETROS_SCHEMA } from './advisor-query-schemas';

export type AdvisorBalanceDeps = {
  userId: string;
  ledger: LedgerService;
};

export function buildAdvisorBalanceTools(deps: AdvisorBalanceDeps): ToolDefinition[] {
  return [
    {
      name: 'consultar_saldo',
      description:
        'Retorna o saldo total (entradas − saídas − investimentos), o total investido e os totais do mês atual. Use para qualquer pergunta sobre quanto o usuário tem.',
      parameters: SEM_PARAMETROS_SCHEMA,
      execute: async () => {
        const entries = await deps.ledger.load(deps.userId);
        const all = totalsOf(entries);
        return {
          saldoTotal: all.balance,
          totalInvestido: all.investments,
          mesAtual: totalsOf(entriesInMonth(entries, getCurrentMonth())),
        };
      },
    },
    {
      name: 'consultar_investimentos',
      description: 'Lista os investimentos do usuário, com total e agrupamento por tipo.',
      parameters: SEM_PARAMETROS_SCHEMA,
      execute: async () => {
        const investments = entriesOfKind(await deps.ledger.load(deps.userId), 'investment');
        return {
          total: totalsOf(investments).investments,
          porTipo: totalsByCategory(investments, 'investment'),
          itens: investments.map((e) => ({ id: e.id, data: e.date, descricao: e.description, tipo: e.category, valor: e.amount })),
        };
      },
    },
  ];
}
