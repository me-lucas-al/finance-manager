'use client';

import { useRef, useEffect } from 'react';
import type { UIMessage } from '@ai-sdk/react';
import { ChatEmptyState } from './chat/ChatEmptyState';
import { ChatMessage } from './chat/ChatMessage';
import { TypingIndicator } from './chat/TypingIndicator';

interface ChatMessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col gap-8 pb-4">
      {messages.length === 0 && <ChatEmptyState />}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
