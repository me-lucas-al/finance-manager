import { NextRequest, NextResponse } from 'next/server';
import { SendWeeklyGoalsSummaryUseCase } from '@/modules/open-finance/application/use-cases/send-weekly-goals-summary';
import {
  SupabaseGoalRepository,
  SupabaseSavingsGoalRepository,
  SupabaseTransactionRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import { GeminiLanguageModel } from '@/modules/ai/infrastructure/gemini-language-model';
import { SupabaseTelegramLinkRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-link-repository';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const useCase = new SendWeeklyGoalsSummaryUseCase(
      new SupabaseGoalRepository(),
      new SupabaseSavingsGoalRepository(),
      new SupabaseTransactionRepository(),
      new GeminiLanguageModel(),
    );
    const userIds = await new SupabaseTelegramLinkRepository().listLinkedUserIds();
    let failed = 0;
    for (const userId of userIds) {
      try {
        await useCase.execute(userId);
      } catch (error) {
        failed++;
        console.error(`weekly-goals-summary failed for user ${userId}:`, error);
      }
    }
    return NextResponse.json({ ok: failed === 0, users: userIds.length, failed });
  } catch (error) {
    console.error('Error executing weekly-goals-summary cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
