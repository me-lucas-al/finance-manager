'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { CHAT_ENDPOINT, deleteChatHistory, fetchChatHistory } from '@/services/chat-service';

export function useAssistantChat() {
  const router = useRouter();
  const transport = useMemo(() => new DefaultChatTransport({ api: CHAT_ENDPOINT }), []);
  const { sendMessage, setMessages, stop, status, ...chat } = useChat({ transport, onFinish: () => router.refresh() });
  const generation = useRef(0);
  const isBusy = status === 'submitted' || status === 'streaming';

  const loadHistory = useCallback(async () => {
    if (isBusy) return;
    const ticket = ++generation.current;
    const history = await fetchChatHistory();
    if (history === null || ticket !== generation.current) return;
    setMessages(history);
  }, [isBusy, setMessages]);

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
    if (await deleteChatHistory()) setMessages([]);
  }, [setMessages, stop]);

  return { ...chat, status, sendMessage: send, setMessages, loadHistory, clearHistory };
}
