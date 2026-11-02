'use server';

import { revalidatePath } from 'next/cache';
import { unstable_update } from '@/auth';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { onboardingStore } from '@/composition/onboarding';
import { telegramLinkRepository } from '@/composition/telegram';
import { resolveBotUsername } from '@/modules/notifications/telegram/resolve-bot-username';

export async function getOnboardingState() {
  const userId = await requireUserId();
  const [completed, chatId] = await Promise.all([
    onboardingStore.isCompleted(userId),
    telegramLinkRepository.findChatIdByUserId(userId),
  ]);
  return { completed, telegramLinked: chatId !== null };
}

export async function completeOnboarding(): Promise<void> {
  const userId = await requireUserId();
  await onboardingStore.complete(userId);
  await unstable_update({});
}

export async function generateTelegramLinkCode(): Promise<{ code: string; botUsername: string | null }> {
  const userId = await requireUserId();
  const code = await telegramLinkRepository.createLinkCode(userId);
  return { code, botUsername: await resolveBotUsername() };
}

export async function getTelegramLinkStatus(): Promise<{ linked: boolean }> {
  const userId = await requireUserId();
  return { linked: (await telegramLinkRepository.findChatIdByUserId(userId)) !== null };
}

export async function unlinkTelegram(): Promise<void> {
  const userId = await requireUserId();
  await telegramLinkRepository.unlink(userId);
  revalidatePath('/settings');
}
