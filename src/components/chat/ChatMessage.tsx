import type { UIMessage } from '@ai-sdk/react';
import { cn } from '@/lib/utils';
import { MessageAvatar } from './MessageAvatar';
import { MessageParts } from './MessageParts';

function legacyMessageText(message: UIMessage): string {
  const legacy = message as unknown as { text?: string; content?: string };
  return legacy.text ?? legacy.content ?? '';
}

export function ChatMessage({ message }: { message: UIMessage }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className="flex gap-4 text-sm flex-row group/msg">
      <MessageAvatar isAssistant={isAssistant} />
      <div className="flex-1 space-y-2 overflow-hidden min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">{isAssistant ? 'Finance AI' : 'Você'}</span>
        </div>
        <div className={cn('leading-relaxed text-sm', isAssistant ? 'text-zinc-100' : 'text-zinc-300')}>
          {message.parts ? (
            <MessageParts parts={message.parts} isAssistant={isAssistant} />
          ) : (
            <span className="whitespace-pre-wrap">{legacyMessageText(message)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
