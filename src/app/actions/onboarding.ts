'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { ledgerCacheTag } from '@/modules/finance/application/services/ledger-cache-tag';
import { unstable_update } from '@/auth';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';
import { chooseDataModeUseCase, dataModeStore } from '@/composition/onboarding';
import { telegramLinkRepository } from '@/composition/telegram';

function parseMode(value: unknown): DataMode {
  if (value !== 'manual' && value !== 'pluggy') throw new Error('Modo inválido');
  return value;
}

async function applyDataMode(userId: string, mode: DataMode): Promise<{ wiped: boolean }> {
  const result = await chooseDataModeUseCase.execute(userId, mode);
  updateTag(ledgerCacheTag(userId));
  revalidatePath('/', 'layout');
  if (result.changed) await unstable_update({});
  return { wiped: result.wiped };
}

export async function getOnboardingState() {
  const userId = await requireUserId();
  const state = await dataModeStore.getState(userId);
  const telegramLinked = (await telegramLinkRepository.findChatIdByUserId(userId)) !== null;
  return { ...state, telegramLinked };
}

export async function chooseDataMode(mode: DataMode): Promise<{ wiped: boolean }> {
  const userId = await requireUserId();
  const state = await dataModeStore.getState(userId);
  if (state.completed) throw new Error('Use a troca de fonte de dados em Configurações.');
  return applyDataMode(userId, parseMode(mode));
}

export async function completeOnboarding(): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const state = await dataModeStore.getState(userId);
  if (!state.dataMode) return { error: 'Escolha uma fonte de dados antes de concluir.' };
  await dataModeStore.complete(userId);
  await unstable_update({});
  return {};
}

export async function switchDataMode(mode: DataMode, confirmation: string): Promise<void> {
  if (confirmation.trim().toUpperCase() !== 'APAGAR') throw new Error('Confirmação inválida');
  const userId = await requireUserId();
  await applyDataMode(userId, parseMode(mode));
}

export async function generateTelegramLinkCode(): Promise<{ code: string; botUsername: string | null }> {
  const userId = await requireUserId();
  const code = await telegramLinkRepository.createLinkCode(userId);
  return { code, botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? null };
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
