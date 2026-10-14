import type { TelegramMessenger } from '@/modules/notifications/telegram/domain/telegram-messenger';
import type { ILanguageModel } from '@/modules/ai/domain/models/language-model';
import type { PeriodSnapshot } from '@/modules/periods/domain/models/period-snapshot';
import type { PeriodSnapshotRepository } from '@/modules/periods/domain/repositories/period-snapshot-repository';

function buildAiPrompt(snapshot: PeriodSnapshot): string {
  return `Gere o relatório de fechamento mensal do usuário e uma "nota de saúde financeira" (A, B, C, D ou F).
Dados do fechamento:
- Receitas: R$ ${snapshot.totalIncomes}
- Despesas: R$ ${snapshot.totalExpenses} (${snapshot.expensePercentage}%)
- Investimentos: R$ ${snapshot.totalInvestments} (${snapshot.investmentPercentage}%)
- Saldo: R$ ${snapshot.balance}
- Status: ${snapshot.status}

Instruções:
Seja direto e honesto. Dê a nota (ex: "Nota: A") e resuma o desempenho. Dê 2 conselhos curtos.`;
}

function buildFallbackMessage(snapshot: PeriodSnapshot): string {
  return `📊 Fechamento Mensal
Receitas: R$ ${snapshot.totalIncomes}
Despesas: R$ ${snapshot.totalExpenses}
Investimentos: R$ ${snapshot.totalInvestments}
Saldo: R$ ${snapshot.balance}`;
}

export class SendMonthlyClosingSummaryUseCase {
  constructor(
    private llm: ILanguageModel,
    private snapshots: PeriodSnapshotRepository,
    private messenger: TelegramMessenger,
  ) {}

  async execute(userId: string, snapshotId: string): Promise<void> {
    const snapshot = await this.snapshots.findByIdAndUserId(snapshotId, userId);
    if (!snapshot) return;

    try {
      const message = await this.llm.generateText(buildAiPrompt(snapshot), { tier: 'pro', maxTokens: 800 });
      await this.messenger.sendMessage(userId, message);
    } catch (error) {
      console.error('Failed to send monthly closing summary via AI', error);
      await this.messenger.sendMessage(userId, buildFallbackMessage(snapshot));
    }
  }
}
