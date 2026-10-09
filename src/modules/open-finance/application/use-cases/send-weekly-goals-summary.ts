import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import type { Goal, GoalRepository } from '../../domain/repositories/goal-repository';
import type { SavingsGoalRepository } from '../../domain/repositories/savings-goal-repository';
import type { TransactionRepository } from '../../domain/repositories/transaction-repository';
import { aggregateMonthlySpending } from '../shared/monthly-spending';
import { ILanguageModel } from '@/modules/ai/domain/models/language-model';
import { buildDeterministicSummary } from './weekly-summary-formatter';

export class SendWeeklyGoalsSummaryUseCase {
  constructor(
    private goalRepository: GoalRepository,
    private savingsGoalRepository: SavingsGoalRepository,
    private transactionRepository: TransactionRepository,
    private llm?: ILanguageModel
  ) {}

  async execute(userId: string): Promise<void> {
    const now = new Date();
    const filterMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const goalMonth = `${filterMonth}-01`;

    const [transactions, goals, savingsGoals] = await Promise.all([
      this.transactionRepository.findAllByUserId(userId, { month: filterMonth, source: 'manual' }),
      this.goalRepository.findAllByUserIdAndMonth(userId, goalMonth),
      this.savingsGoalRepository.findAllActiveByUserId(userId),
    ]);

    const categorized = transactions.filter((t) => t.status === 'categorized');
    const { totalSpent, spendByCategory } = aggregateMonthlySpending(categorized);
    const superfluousTotal = categorized
      .filter((t) => t.necessity === 'superfluo')
      .reduce((s, t) => s + Number(t.amount), 0);

    const generalGoal = goals.find((g) => g.category === null) ?? null;
    const categoryTargets = goals
      .filter((g): g is Goal & { category: string } => g.category !== null)
      .map((g) => ({ category: g.category, targetAmount: g.targetAmount }));

    let message: string;
    if (this.llm) {
      try {
        const prompt = `Gere o relatório financeiro semanal do usuário no Telegram.
Dados da semana/mês:
- Total gasto: R$ ${totalSpent.toFixed(2)}
- Gastos supérfluos identificados: R$ ${superfluousTotal.toFixed(2)}
- Categorias: ${JSON.stringify(Object.fromEntries(spendByCategory))}
- Metas definidas: ${JSON.stringify(categoryTargets)}
Instruções:
Destaque o total, as maiores categorias, os supérfluos ('bobeiras') e forneça 3 sugestões práticas e diretas para economizar nos próximos dias. Seja honesto e direto.`;
        message = await this.llm.generateText(prompt, { tier: 'pro', maxTokens: 1200 });
      } catch {
        message = buildDeterministicSummary({
          totalSpent,
          spendByCategory,
          superfluousTotal,
          generalTarget: generalGoal?.targetAmount ?? null,
          categoryTargets,
          savingsGoals,
        });
      }
    } else {
      message = buildDeterministicSummary({
        totalSpent,
        spendByCategory,
        superfluousTotal,
        generalTarget: generalGoal?.targetAmount ?? null,
        categoryTargets,
        savingsGoals,
      });
    }

    await TelegramService.sendMessage(message);
  }
}
