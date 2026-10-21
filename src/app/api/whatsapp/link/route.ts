import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { linkWhatsapp } from '@/composition/whatsapp';
import { pairingEventStream } from './pairing-event-stream';

export const maxDuration = 300;

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pairing = new AbortController();
  request.signal.addEventListener('abort', () => pairing.abort());

  return new Response(pairingEventStream(linkWhatsapp.execute(userId, pairing.signal), () => pairing.abort()), {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
