import { NextRequest, NextResponse } from 'next/server';
import { SendWeeklyGoalsSummaryUseCase } from '@/modules/open-finance/application/use-cases/send-weekly-goals-summary';
import {
  SupabaseGoalRepository,
  SupabaseSavingsGoalRepository,
  SupabaseTransactionRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = process.env.FINANCE_OWNER_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: 'FINANCE_OWNER_USER_ID is not configured' }, { status: 500 });
  }

  try {
    const useCase = new SendWeeklyGoalsSummaryUseCase(
      new SupabaseGoalRepository(),
      new SupabaseSavingsGoalRepository(),
      new SupabaseTransactionRepository(),
    );
    await useCase.execute(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error executing weekly-goals-summary cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
