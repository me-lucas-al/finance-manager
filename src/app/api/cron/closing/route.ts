import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { financialPeriods } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { closeFinancialPeriod } from '@/modules/finance/application/periods/close-financial-period';

export async function GET(req: NextRequest) {
  // Protect cron route (assuming Vercel passes a secret)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Find all OPEN periods where endDate is in the past
    const now = new Date();
    const periodsToClose = await db.select().from(financialPeriods).where(
      eq(financialPeriods.status, 'OPEN')
    );

    const expiredPeriods = periodsToClose.filter(p => new Date(p.endDate) < now);

    let closedCount = 0;
    const errors: { periodId: string; error: string }[] = [];

    // 2. Iterate and close each period securely
    for (const period of expiredPeriods) {
      try {
        await closeFinancialPeriod(period.id, period.userId);
        closedCount++;
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
}
