import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { GoalsChatMessage } from '@/types/goals';

interface GoalsChatMessagesProps {
  messages: GoalsChatMessage[];
  isPending: boolean;
}

export function GoalsChatMessages({ messages, isPending }: GoalsChatMessagesProps) {
  return (
    <ScrollArea className="h-72 rounded-lg border border-zinc-800/80 bg-[#09090b] p-3">
      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm',
              message.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-zinc-800/80 text-zinc-100',
            )}
          >
            {message.text}
          </div>
        ))}
        {isPending && (
          <div className="max-w-[85%] rounded-lg bg-zinc-800/80 px-3 py-2 text-sm text-zinc-400">Pensando...</div>
        )}
      </div>
    </ScrollArea>
  );
}
