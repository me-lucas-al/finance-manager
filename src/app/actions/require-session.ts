import { auth } from '@/auth';

export async function getEffectiveUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function requireUserId(): Promise<string> {
  return getEffectiveUserId();
}
