import { NextResponse } from 'next/server';
import { relayOutbox } from '@/composition/outbox';
import { withCronAuth } from '../with-cron-auth';

export const maxDuration = 60;

export const GET = withCronAuth(async () => {
  try {
    const result = await relayOutbox.execute();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Error executing process-outbox cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
