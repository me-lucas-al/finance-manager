'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputForm } from './ChatInputForm';

export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { messages, status, sendMessage } = useChat({
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black border border-white/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] active:scale-95 group overflow-hidden"
        aria-label="Abrir assistente financeiro"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="h-6 w-6 text-zinc-300 group-hover:text-white transition-colors" />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-black/60 backdrop-blur-2xl border-white/5 border-l">
        <SheetHeader className="p-5 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 text-white shadow-inner">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <SheetTitle className="text-zinc-100 text-xl font-light tracking-tight">Finance AI</SheetTitle>
              <p className="text-sm text-zinc-500 font-medium tracking-wide">ASSISTENTE INTELIGENTE</p>
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-5 py-6">
          <ChatMessageList messages={messages} isLoading={isLoading} />
        </ScrollArea>
        
        <div className="px-5 pb-5">
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
