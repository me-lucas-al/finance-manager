import { NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/app/actions/require-session';

export type UserAuthorization = { userId: string; response?: undefined } | { userId?: undefined; response: Response };

export async function authorizeUser(): Promise<UserAuthorization> {
  try {
    return { userId: await getEffectiveUserId() };
  } catch {
    return {
      response: NextResponse.json({ error: 'No authenticated session' }, { status: 401, headers: { 'Cache-Control': 'no-store' } }),
    };
  }
}
