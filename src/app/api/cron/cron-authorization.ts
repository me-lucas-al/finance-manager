import { NextRequest, NextResponse } from 'next/server';

export function rejectUnauthorizedCron(req: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') === `Bearer ${secret}`) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
