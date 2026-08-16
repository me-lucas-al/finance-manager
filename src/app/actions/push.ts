'use server';

import { requireUserId } from './require-session';

export async function getPushPublicKey(): Promise<string | null> {
  await requireUserId();
  return process.env.PUSH_PUBLIC_KEY ?? null;
}
