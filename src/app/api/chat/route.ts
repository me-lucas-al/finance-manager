import { buildAdvisorServices } from '@/composition/ai';
import { authorizeUser } from '@/modules/auth/infrastructure/authorize-user';
import { extractLastUserText } from './chat-request';
import { textStreamToUIResponse } from './text-stream-response';

export const maxDuration = 60;

export async function POST(req: Request) {
  const authorization = await authorizeUser();
  if (authorization.response) return authorization.response;

  const payload = await req.json().catch(() => null);
  const messages = payload?.messages;
  const userMessage = extractLastUserText(messages);
  if (!userMessage) return new Response('Mensagem vazia', { status: 400 });

  const { advisorChat } = buildAdvisorServices();
  return textStreamToUIResponse(advisorChat.stream(authorization.userId, userMessage, 'web'));
}
