'use server';

import { revalidatePath } from 'next/cache';
import { unstable_update } from '@/auth';
import { requireUserId } from './require-session';
import { ChooseDataModeUseCase, type DataMode } from '@/modules/onboarding/application/choose-data-mode';
import { DrizzleDataModeStore } from '@/modules/onboarding/infrastructure/drizzle-data-mode-store';
import { LedgerResetter } from '@/modules/onboarding/infrastructure/ledger-resetter';
import { SupabaseTelegramLinkRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-link-repository';

function parseMode(value: unknown): DataMode {
  if (value !== 'manual' && value !== 'pluggy') throw new Error('Modo inválido');
  return value;
}

async function applyDataMode(userId: string, mode: DataMode): Promise<{ wiped: boolean }> {
  const result = await new ChooseDataModeUseCase(new DrizzleDataModeStore(), new LedgerResetter()).execute(userId, mode);
  revalidatePath('/', 'layout');
  if (result.changed) await unstable_update({});
  return { wiped: result.wiped };
}

export async function getOnboardingState() {
  const userId = await requireUserId();
  const state = await new DrizzleDataModeStore().getState(userId);
  const telegramLinked = (await new SupabaseTelegramLinkRepository().findChatIdByUserId(userId)) !== null;
  return { ...state, telegramLinked };
}

export async function chooseDataMode(mode: DataMode): Promise<{ wiped: boolean }> {
  const userId = await requireUserId();
  const state = await new DrizzleDataModeStore().getState(userId);
  if (state.completed) throw new Error('Use a troca de fonte de dados em Configurações.');
  return applyDataMode(userId, parseMode(mode));
}

export async function completeOnboarding(): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const store = new DrizzleDataModeStore();
  const state = await store.getState(userId);
  if (!state.dataMode) return { error: 'Escolha uma fonte de dados antes de concluir.' };
  await store.complete(userId);
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
  const code = await new SupabaseTelegramLinkRepository().createLinkCode(userId);
  return { code, botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? null };
}

export async function getTelegramLinkStatus(): Promise<{ linked: boolean }> {
  const userId = await requireUserId();
  return { linked: (await new SupabaseTelegramLinkRepository().findChatIdByUserId(userId)) !== null };
}

export async function unlinkTelegram(): Promise<void> {
  const userId = await requireUserId();
  await new SupabaseTelegramLinkRepository().unlink(userId);
  revalidatePath('/settings');
}
