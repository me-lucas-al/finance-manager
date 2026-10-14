import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pluggyModeRequiredResponse } from '../pluggy-mode';
import { getPluggyConnectToken } from '@/modules/pluggy-sync/infrastructure/pluggy/connect-token';

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const modeResponse = await pluggyModeRequiredResponse(userId);
  if (modeResponse) return modeResponse;

  try {
    const accessToken = await getPluggyConnectToken(userId);
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error generating connect token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
