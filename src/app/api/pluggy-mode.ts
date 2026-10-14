import { NextResponse } from 'next/server';
import { dataModeStore } from '@/composition/onboarding';

export async function isPluggyMode(userId: string): Promise<boolean> {
  const { dataMode } = await dataModeStore.getState(userId);
  return dataMode === 'pluggy';
}

export async function pluggyModeRequiredResponse(userId: string): Promise<Response | null> {
  if (await isPluggyMode(userId)) return null;
  return NextResponse.json({ error: 'A conexão bancária só está disponível no modo Pluggy.' }, { status: 409 });
}
