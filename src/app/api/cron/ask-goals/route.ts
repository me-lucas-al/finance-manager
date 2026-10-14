import { NextRequest, NextResponse } from 'next/server';
import { AskFinancialGoalsUseCase } from '@/modules/open-finance/application/use-cases/ask-financial-goals';
import {
  SupabaseGoalPromptRepository,
  SupabaseGoalRepository,
  SupabaseSavingsGoalRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import { SupabaseTelegramLinkRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-link-repository';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const useCase = new AskFinancialGoalsUseCase(
      new SupabaseGoalRepository(),
      new SupabaseSavingsGoalRepository(),
      new SupabaseGoalPromptRepository(),
    );
    const userIds = await new SupabaseTelegramLinkRepository().listLinkedUserIds();
    let failed = 0;
    for (const userId of userIds) {
      try {
        await useCase.execute(userId);
      } catch (error) {
        failed++;
        console.error(`ask-goals failed for user ${userId}:`, error);
      }
    }
    return NextResponse.json({ ok: failed === 0, users: userIds.length, failed });
  } catch (error) {
    console.error('Error executing ask-goals cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
