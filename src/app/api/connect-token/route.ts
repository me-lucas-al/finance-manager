import { NextResponse } from 'next/server';
import { getPluggyConnectToken } from '@/lib/pluggy';
import { getEffectiveUserId } from '@/app/actions/require-session';

export async function POST() {
  try {
    const userId = await getEffectiveUserId();
    const accessToken = await getPluggyConnectToken(userId);
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error generating connect token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
