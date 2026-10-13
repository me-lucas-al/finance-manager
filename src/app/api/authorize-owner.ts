import { NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { OwnerResolutionError } from '@/modules/auth/domain/resolve-owner-user-id';

export type OwnerAuthorization = { userId: string; response?: undefined } | { userId?: undefined; response: Response };

export async function authorizeOwner(): Promise<OwnerAuthorization> {
  try {
    return { userId: await getEffectiveUserId() };
  } catch (error) {
    if (!(error instanceof OwnerResolutionError)) throw error;
    const status = error.failure === 'unauthenticated' ? 401 : 403;
    return {
      response: NextResponse.json({ error: error.message }, { status, headers: { 'Cache-Control': 'no-store' } }),
    };
  }
}
