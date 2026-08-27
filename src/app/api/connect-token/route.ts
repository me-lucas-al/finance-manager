import { NextRequest, NextResponse } from 'next/server';
import { getPluggyConnectToken } from '@/lib/pluggy';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await getPluggyConnectToken(session.user.id);
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error generating connect token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
