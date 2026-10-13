import { NextRequest, NextResponse } from 'next/server';
import { createFixedEntryServices } from '@/modules/finance/infrastructure/create-fixed-entry-services';
import { rejectUnauthorizedCron } from '../cron-authorization';

export async function GET(req: NextRequest) {
  const rejection = rejectUnauthorizedCron(req);
  if (rejection) return rejection;

  const userId = process.env.FINANCE_OWNER_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: 'FINANCE_OWNER_USER_ID is not configured' }, { status: 500 });
  }

  try {
    const services = createFixedEntryServices();
    const generation = await services.generate.execute(userId);
    const remindersSent = await services.reminders.execute(userId);
    return NextResponse.json({ ok: generation.failed === 0, generation, remindersSent });
  } catch (error) {
    console.error('Error executing fixed-entries cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
