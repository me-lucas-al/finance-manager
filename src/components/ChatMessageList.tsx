import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AssistantAvatar } from './AssistantAvatar';
import type { Message } from 'ai/react';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {messages.length === 0 && (
        <div className="text-center mt-10 text-zinc-500 text-sm">
          <p>Olá! Sou seu assistente financeiro.</p>
          <p>Você pode me perguntar sobre seus saldos, despesas, ou pedir para definir novas metas.</p>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 text-sm",
            message.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}
        >
          {message.role === 'assistant' ? (
            <AssistantAvatar />
          ) : (
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-zinc-800 text-zinc-300">Você</AvatarFallback>
            </Avatar>
          )}
          
          <div
            className={cn(
              "rounded-xl px-4 py-2 max-w-[80%]",
              message.role === 'user'
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-200"
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-3 text-sm flex-row">
          <AssistantAvatar />
          <div className="rounded-xl px-4 py-2 bg-zinc-800 text-zinc-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      )}
    </div>
  );
}
