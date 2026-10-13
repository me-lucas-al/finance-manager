import { NextResponse } from 'next/server';
import {
  fixedEntryRepository,
  generateDueFixedEntries,
  sendFixedEntryReminders,
} from '@/composition/fixed-entries';
import { runForUsers } from '../run-for-users';
import { withCronAuth } from '../with-cron-auth';

export const GET = withCronAuth(async () => {
  try {
    const userIds = await fixedEntryRepository.findUserIdsWithActiveEntries();
    const totals = { launched: 0, launchFailures: 0, remindersSent: 0 };
    const { users, failed } = await runForUsers('fixed-entries', userIds, async (userId) => {
      const report = await generateDueFixedEntries.execute(userId);
      totals.launched += report.launched;
      totals.launchFailures += report.failed;
      totals.remindersSent += await sendFixedEntryReminders.execute(userId);
    });
    return NextResponse.json({ ok: failed === 0 && totals.launchFailures === 0, users, failed, ...totals });
  } catch (error) {
    console.error('Error executing fixed-entries cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
