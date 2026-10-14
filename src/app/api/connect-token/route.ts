import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DrizzleDataModeStore } from '@/modules/onboarding/infrastructure/drizzle-data-mode-store';
import { getPluggyConnectToken } from '@/lib/pluggy';

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if ((await new DrizzleDataModeStore().getState(userId)).dataMode !== 'pluggy') {
    return NextResponse.json({ error: 'A conexão bancária só está disponível no modo Pluggy.' }, { status: 409 });
  }

  try {
    const accessToken = await getPluggyConnectToken(userId);
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error generating connect token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
