import { NextResponse } from 'next/server';
import { closePeriod, sendMonthlyClosingSummary } from '@/composition/period-closing';
import { periodRepository } from '@/composition/periods';
import { withCronAuth } from '../with-cron-auth';

export const GET = withCronAuth(async () => {
  try {
    const expiredPeriods = await periodRepository.findOpenEndedBefore(new Date());

    let closedCount = 0;
    const errors: { periodId: string; error: string }[] = [];

    for (const period of expiredPeriods) {
      try {
        const result = await closePeriod(period.id, period.userId);
        closedCount++;

        if (result.snapshotId) await sendMonthlyClosingSummary.execute(period.userId, result.snapshotId);
      } catch (error) {
        errors.push({ periodId: period.id, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Checked ${expiredPeriods.length} expired periods. Successfully closed ${closedCount}.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error executing closing cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
