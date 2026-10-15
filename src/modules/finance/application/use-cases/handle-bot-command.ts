import { UndoLastEntryService } from '../services/undo-last-entry-service';
import { LedgerService } from '../services/ledger-service';
import { PortfolioService } from '../services/portfolio-service';
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
/editar   - Corrige o último lançamento (ex.: /editar valor 45,90)
/resumo   - Snapshot financeiro do mês
/ajuda    - Mostra este menu de instruções`;

export type LastEntryEditor = { execute(userId: string, argumentsText: string): Promise<string> };

export class HandleBotCommandUseCase {
  constructor(
    private undoService: UndoLastEntryService,
    private editLastEntry: LastEntryEditor,
    private ledger: LedgerService,
    private portfolio: PortfolioService,
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
      return this.editLastEntry.execute(userId, command.trim().slice(norm.length));
    }

    if (norm === '/resumo') {
      const curMonth = getCurrentMonth();
      const [entries, portfolio, goals] = await Promise.all([
        this.ledger.load(userId),
        this.portfolio.load(userId),
        this.goalRepo.findAllByUserIdAndMonth(userId, `${curMonth}-01`),
      ]);

      const snapshot = calculateFinancialSnapshot({ entries, goals, portfolio, referenceMonth: curMonth });

      return formatMonthSummary(snapshot, curMonth);
    }

    return `Comando desconhecido. Digite /ajuda para ver as opções.`;
  }
}
