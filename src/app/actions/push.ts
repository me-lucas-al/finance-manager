'use server';

import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';

export async function getPushPublicKey(): Promise<string | null> {
  await requireUserId();
  return process.env.PUSH_PUBLIC_KEY ?? null;
}
