import { NextResponse } from 'next/server';
import { authorizeUser } from '@/app/api/authorize-user';
import { SupabaseChatMessageRepository } from '@/modules/ai/infrastructure/supabase-chat-message-repository';

const HISTORY_LIMIT = 40;
const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET() {
  const authorization = await authorizeUser();
  if (authorization.response) return authorization.response;

  const recent = await new SupabaseChatMessageRepository().findRecentByUserId(authorization.userId, HISTORY_LIMIT);
  const messages = recent
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map(({ id, role, content, channel }) => ({ id, role, content, channel }));
  return NextResponse.json({ messages }, { headers: NO_STORE });
}

export async function DELETE() {
  const authorization = await authorizeUser();
  if (authorization.response) return authorization.response;

  await new SupabaseChatMessageRepository().deleteAllByUserId(authorization.userId);
  return NextResponse.json({ cleared: true }, { headers: NO_STORE });
}
