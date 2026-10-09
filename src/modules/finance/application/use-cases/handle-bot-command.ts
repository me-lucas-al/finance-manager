import { UndoLastEntryService } from '../services/undo-last-entry-service';
import { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { IncomeRepository } from '../../domain/repositories/income-repository';
import { InvestmentRepository } from '../../domain/repositories/investment-repository';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { calculateFinancialSnapshot } from '../../domain/services/calculate-financial-snapshot';
import { formatMonthSummary } from '../services/month-summary-formatter';
import { getCurrentMonth } from '@/lib/month';

const HELP_MESSAGE = `🤖 Comandos do Assistente Financeiro:

📝 Lançamento Rápido:
Envie no formato: tipo | categoria | descrição | valor
Exemplos:
• saída | mercado | arroz e feijão | 25,90
• entrada | salário | empresa X | 5000
• investimento | tesouro | selic | 300

Ou escreva naturalmente, ex: "gastei 50 no almoço".

⚡ Comandos Rápidos:
/desfazer - Remove o último lançamento
/editar   - Instruções para corrigir o último lançamento
/resumo   - Snapshot financeiro do mês
/ajuda    - Mostra este menu de instruções`;

export class HandleBotCommandUseCase {
  constructor(
    private undoService: UndoLastEntryService,
    private transactionRepo: TransactionRepository,
    private incomeRepo: IncomeRepository,
    private investmentRepo: InvestmentRepository,
    private goalRepo: GoalRepository
  ) {}

  async execute(userId: string, command: string): Promise<string> {
    const norm = command.toLowerCase().trim().split(' ')[0];

    if (norm === '/ajuda' || norm === '/help' || norm === '/start') {
      return HELP_MESSAGE;
    }

    if (norm === '/desfazer') {
      return this.undoService.execute(userId);
    }

    if (norm === '/editar') {
      return `✏️ Para editar seu último lançamento: use /desfazer para remover e depois envie o novo formato correto (tipo | categoria | descrição | valor).`;
    }

    if (norm === '/resumo') {
      const curMonth = getCurrentMonth();
      const [txs, incs, invs, goals] = await Promise.all([
        this.transactionRepo.findAllByUserId(userId, { source: 'manual' }),
        this.incomeRepo.findPageByUserId(userId, { limit: 100, offset: 0 }).then((p) => p.rows),
        this.investmentRepo.findPageByUserId(userId, { limit: 100, offset: 0 }).then((p) => p.rows),
        this.goalRepo.findAllByUserIdAndMonth(userId, `${curMonth}-01`),
      ]);

      const snapshot = calculateFinancialSnapshot({
        transactions: txs,
        incomes: incs,
        investments: invs,
        goals,
        referenceMonth: curMonth,
      });

      return formatMonthSummary(snapshot, curMonth);
    }

    return `Comando desconhecido. Digite /ajuda para ver as opções.`;
  }
}
