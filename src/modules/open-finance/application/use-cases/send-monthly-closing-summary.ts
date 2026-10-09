import { TelegramService } from '@/modules/notifications/telegram/TelegramService';
import { ILanguageModel } from '@/modules/ai/domain/models/language-model';
import { db } from '@/db';
import { periodSnapshots } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export class SendMonthlyClosingSummaryUseCase {
  constructor(private llm: ILanguageModel) {}

  async execute(userId: string, snapshotId: string): Promise<void> {
    const [snapshot] = await db
      .select()
      .from(periodSnapshots)
      .where(and(eq(periodSnapshots.id, snapshotId), eq(periodSnapshots.userId, userId)));

    if (!snapshot) return;

    try {
      const prompt = `Gere o relatório de fechamento mensal do usuário e uma "nota de saúde financeira" (A, B, C, D ou F).
Dados do fechamento:
- Receitas: R$ ${snapshot.totalIncomes}
- Despesas: R$ ${snapshot.totalExpenses} (${snapshot.expensePercentage}%)
- Investimentos: R$ ${snapshot.totalInvestments} (${snapshot.investmentPercentage}%)
- Saldo: R$ ${snapshot.balance}
- Status: ${snapshot.status}

Instruções:
Seja direto e honesto. Dê a nota (ex: "Nota: A") e resuma o desempenho. Dê 2 conselhos curtos.`;

      const message = await this.llm.generateText(prompt, { tier: 'pro', maxTokens: 800 });
      await TelegramService.sendMessage(message);
    } catch (error) {
      console.error('Failed to send monthly closing summary via AI', error);
      const fallback = `📊 Fechamento Mensal
Receitas: R$ ${snapshot.totalIncomes}
Despesas: R$ ${snapshot.totalExpenses}
Investimentos: R$ ${snapshot.totalInvestments}
Saldo: R$ ${snapshot.balance}`;
      await TelegramService.sendMessage(fallback);
    }
  }
}
