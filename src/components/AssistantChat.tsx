'use client';

import React, { useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputForm } from './ChatInputForm';

export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);

  const { messages, status, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleClearChat = () => setMessages([]);

  const handleEditMessage = (index: number, text: string) => {
    setMessages((prev) => prev.slice(0, index));
    setInput(text);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black border border-white/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] active:scale-95 group overflow-hidden"
        aria-label="Abrir assistente financeiro"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="h-6 w-6 text-zinc-300 group-hover:text-white transition-colors" />
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-dvh bg-black/60 backdrop-blur-2xl border-white/5 border-l">
        <SheetHeader className="p-5 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 text-white shadow-inner">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <SheetTitle className="text-zinc-100 text-xl font-light tracking-tight">Finance AI</SheetTitle>
                <p className="text-sm text-zinc-500 font-medium tracking-wide">ASSISTENTE INTELIGENTE</p>
              </div>
            </div>

            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                aria-label="Limpar conversa"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            onEditMessage={handleEditMessage}
          />
        </div>

        <div className="px-5 pb-5 shrink-0">
          <ChatInputForm
            input={input}
            isLoading={isLoading}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
