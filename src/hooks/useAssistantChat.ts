'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

type StoredMessage = { id: string; role: 'user' | 'assistant'; content: string };

function toUIMessage(message: StoredMessage): UIMessage {
  return { id: message.id, role: message.role, parts: [{ type: 'text', text: message.content }] };
}

async function fetchHistory(): Promise<UIMessage[] | null> {
  try {
    const response = await fetch('/api/chat/history', { cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as { messages: StoredMessage[] };
    return body.messages.map(toUIMessage);
  } catch {
    return null;
  }
}

async function deleteHistory(): Promise<boolean> {
  try {
    return (await fetch('/api/chat/history', { method: 'DELETE' })).ok;
  } catch {
    return false;
  }
}

export function useAssistantChat() {
  const router = useRouter();
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);
  const { sendMessage, setMessages, stop, status, ...chat } = useChat({ transport, onFinish: () => router.refresh() });
  const generation = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    busy.current = status === 'submitted' || status === 'streaming';
  }, [status]);

  const loadHistory = useCallback(async () => {
    if (busy.current) return;
    const ticket = ++generation.current;
    const history = await fetchHistory();
    if (history === null || ticket !== generation.current || busy.current) return;
    setMessages(history);
  }, [setMessages]);

  const send = useCallback(
    (...args: Parameters<typeof sendMessage>) => {
      generation.current += 1;
      return sendMessage(...args);
    },
    [sendMessage]
  );

  const clearHistory = useCallback(async () => {
    generation.current += 1;
    await stop();
    if (await deleteHistory()) setMessages([]);
  }, [setMessages, stop]);

  return { ...chat, status, sendMessage: send, setMessages, loadHistory, clearHistory };
}
