import { auth } from '@/auth';
import { resolveOwnerUserId } from '@/modules/auth/domain/resolve-owner-user-id';

export async function getEffectiveUserId(): Promise<string> {
  const session = await auth();
  return resolveOwnerUserId(session?.user?.id, process.env.FINANCE_OWNER_USER_ID);
}

export async function requireUserId(): Promise<string> {
  return getEffectiveUserId();
}
