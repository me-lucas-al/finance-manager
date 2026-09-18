'use client';

import { useRef, useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { UIMessage } from '@ai-sdk/react';

interface ChatMessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
  onEditMessage: (index: number, text: string) => void;
}

function AssistantMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
        code: ({ children }) => (
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-purple-300">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto rounded-lg bg-black/40 border border-white/5 p-3 text-xs font-mono">{children}</pre>
        ),
        h1: ({ children }) => <h1 className="mb-2 text-base font-semibold text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 text-sm font-semibold text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-1 text-sm font-medium text-zinc-200">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-purple-500/50 pl-3 text-zinc-400 italic">{children}</blockquote>
        ),
        hr: () => <hr className="my-3 border-white/10" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export function ChatMessageList({ messages, isLoading, onEditMessage }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

      {messages.map((message, index) => {
        const textPart = message.parts?.find((p) => p.type === 'text');
        const fallback = message as unknown as { text?: string; content?: string };
        const messageText =
          textPart && 'text' in textPart && typeof textPart.text === 'string'
            ? textPart.text
            : fallback.text ?? fallback.content ?? '';

        return (
          <div
            key={message.id}
            className="flex gap-4 text-sm flex-row group/msg"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
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

            <div className="flex-1 space-y-2 overflow-hidden min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">
                  {message.role === 'assistant' ? 'Finance AI' : 'Você'}
                </span>
                {message.role === 'user' && (
                  <button
                    onClick={() => onEditMessage(index, messageText)}
                    className={cn(
                      'transition-opacity text-zinc-600 hover:text-zinc-300',
                      hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                    )}
                    aria-label="Editar mensagem"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className={cn('leading-relaxed text-sm', message.role === 'user' ? 'text-zinc-300' : 'text-zinc-100')}>
                {message.parts ? (
                  message.parts.map((part, i) => {
                    if (part.type === 'text') {
                      return message.role === 'assistant' ? (
                        <AssistantMessage key={i} text={part.text} />
                      ) : (
                        <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                      );
                    }
                    if (part.type.startsWith('tool-') || part.type === 'dynamic-tool') {
                      return (
                        <div key={i} className="my-3 rounded-xl bg-black/40 border border-white/5 p-3 text-xs text-zinc-400 flex items-center gap-3 w-max">
                          <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
                          </div>
                          Acessando seus dados financeiros...
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <span className="whitespace-pre-wrap">{messageText}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

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
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
