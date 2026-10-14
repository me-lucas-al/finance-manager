import type { UIMessage } from '@ai-sdk/react';
import type { StoredChatMessage } from '@/types/chat';

export const CHAT_ENDPOINT = '/api/chat';
const HISTORY_ENDPOINT = '/api/chat/history';

function toUIMessage(message: StoredChatMessage): UIMessage {
  return { id: message.id, role: message.role, parts: [{ type: 'text', text: message.content }] };
}

export async function fetchChatHistory(): Promise<UIMessage[] | null> {
  try {
    const response = await fetch(HISTORY_ENDPOINT, { cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as { messages: StoredChatMessage[] };
    return body.messages.map(toUIMessage);
  } catch {
    return null;
  }
}

export async function deleteChatHistory(): Promise<boolean> {
  try {
    return (await fetch(HISTORY_ENDPOINT, { method: 'DELETE' })).ok;
  } catch {
    return false;
  }
}
