import { NextResponse } from 'next/server';
import { sendWeeklyGoalsSummary } from '@/composition/open-finance';
import { telegramLinkRepository } from '@/composition/telegram';
import { runForUsers } from '../run-for-users';
import { withCronAuth } from '../with-cron-auth';

export const GET = withCronAuth(async () => {
  try {
    const userIds = await telegramLinkRepository.listLinkedUserIds();
    const { users, failed } = await runForUsers('weekly-goals-summary', userIds, (userId) =>
      sendWeeklyGoalsSummary.execute(userId)
    );
    return NextResponse.json({ ok: failed === 0, users, failed });
  } catch (error) {
    console.error('Error executing weekly-goals-summary cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
