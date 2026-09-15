import { auth } from '@/auth';

export async function getEffectiveUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id ?? process.env.FINANCE_OWNER_USER_ID ?? '3dd11c4e-e3c6-4a97-adb4-431ca7f476f1';
  return userId;
}

export async function requireUserId(): Promise<string> {
  return getEffectiveUserId();
}
