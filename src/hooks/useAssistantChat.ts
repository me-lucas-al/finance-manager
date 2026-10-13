'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

type StoredMessage = { id: string; role: 'user' | 'assistant'; content: string };

function toUIMessage(message: StoredMessage): UIMessage {
  return { id: message.id, role: message.role, parts: [{ type: 'text', text: message.content }] };
}

async function fetchHistory(): Promise<UIMessage[]> {
  try {
    const response = await fetch('/api/chat/history', { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as { messages: StoredMessage[] };
    return body.messages.map(toUIMessage);
  } catch {
    return [];
  }
}

export function useAssistantChat() {
  const router = useRouter();
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);
  const chat = useChat({ transport, onFinish: () => router.refresh() });
  const { setMessages } = chat;
  const historyLoaded = useRef(false);

  const loadHistory = useCallback(async () => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;
    const history = await fetchHistory();
    setMessages((current) => (current.length > 0 ? current : history));
  }, [setMessages]);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    await fetch('/api/chat/history', { method: 'DELETE' }).catch(() => undefined);
  }, [setMessages]);

  return { ...chat, loadHistory, clearHistory };
}
