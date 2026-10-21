import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { linkWhatsapp } from '@/composition/whatsapp';
import { pairingEventStream } from './pairing-event-stream';

export const maxDuration = 300;

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return new Response(pairingEventStream(linkWhatsapp.execute(userId, request.signal)), {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
