'use server';

import { revalidatePath } from 'next/cache';
import { getWhatsappStatus, unlinkWhatsapp } from '@/composition/whatsapp';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';

export async function getWhatsappConnection(): Promise<{ connected: boolean }> {
  const userId = await requireUserId();
  return getWhatsappStatus.execute(userId);
}

export async function disconnectWhatsapp(): Promise<void> {
  const userId = await requireUserId();
  await unlinkWhatsapp.execute(userId);
  revalidatePath('/settings');
}
