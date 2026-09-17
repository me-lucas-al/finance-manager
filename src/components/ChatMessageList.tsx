import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AssistantAvatar } from './AssistantAvatar';
import type { UIMessage } from '@ai-sdk/react';

interface ChatMessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  return (
    <div className="flex flex-col gap-8 pb-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-zinc-500 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center">
            <span className="text-2xl opacity-50">✨</span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-zinc-300 font-medium">Olá! Sou sua inteligência financeira.</p>
            <p className="text-xs">Pergunte sobre seus saldos, transações ou insights de gastos.</p>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className="flex gap-4 text-sm flex-row"
        >
          {message.role === 'assistant' ? (
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mt-0.5">
              <span className="text-[10px]">AI</span>
            </div>
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
              <span className="text-zinc-400 text-[10px]">VC</span>
            </div>
          )}
          
          <div className="flex-1 space-y-2 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">
                {message.role === 'assistant' ? 'Finance AI' : 'Você'}
              </span>
            </div>
            <div className={cn(
              "whitespace-pre-wrap leading-relaxed",
              message.role === 'user' ? "text-zinc-300" : "text-zinc-100"
            )}>
              {message.parts ? message.parts.map((part, index) => {
                if (part.type === 'text') {
                  return <span key={index}>{part.text}</span>;
                }
                if (part.type.startsWith('tool-') || part.type === 'dynamic-tool') {
                  return (
                    <div key={index} className="my-3 rounded-xl bg-black/40 border border-white/5 p-3 text-xs text-zinc-400 flex items-center gap-3 w-max">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </div>
                      Acessando seus dados financeiros...
                    </div>
                  );
                }
                return null;
              }) : (
                <span>{(message as any).text || (message as any).content}</span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-4 text-sm flex-row">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mt-0.5">
            <span className="text-[10px]">AI</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-zinc-500">Finance AI</span>
            </div>
            <div className="flex items-center gap-1.5 h-6">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
