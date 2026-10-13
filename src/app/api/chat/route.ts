import { authorizeOwner } from '@/app/api/authorize-owner';
import { buildAdvisorServices } from '@/modules/ai/infrastructure/build-advisor-services';
import { extractLastUserText } from './chat-request';
import { textStreamToUIResponse } from './text-stream-response';

export const maxDuration = 60;

export async function POST(req: Request) {
  const authorization = await authorizeOwner();
  if (authorization.response) return authorization.response;

  const payload = await req.json().catch(() => null);
  const messages = payload?.messages;
  const userMessage = extractLastUserText(messages);
  if (!userMessage) return new Response('Mensagem vazia', { status: 400 });

  const { advisorChat } = buildAdvisorServices();
  return textStreamToUIResponse(advisorChat.stream(authorization.userId, userMessage, 'web'));
}
