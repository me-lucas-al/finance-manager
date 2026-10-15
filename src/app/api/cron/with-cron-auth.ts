import { NextResponse, type NextRequest } from 'next/server';

type CronHandler = (req: NextRequest) => Promise<Response>;

function isAuthorized(req: NextRequest): boolean {
  const authorization = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authorization === `Bearer ${secret}`;
}

export function withCronAuth(handler: CronHandler): CronHandler {
  return async (req) => {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(req);
  };
}
