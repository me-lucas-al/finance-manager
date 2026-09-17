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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:scale-110 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95 group"
        aria-label="Abrir assistente financeiro"
      >
        <Sparkles className="h-6 w-6 group-hover:animate-pulse" />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-[#09090b] border-zinc-800 border-l">
        <SheetHeader className="p-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-zinc-100 text-lg">Finance AI</SheetTitle>
              <p className="text-xs text-zinc-400">Seu assistente financeiro inteligente</p>
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-4">
          <ChatMessageList messages={messages} isLoading={isLoading} />
        </ScrollArea>
        
        <ChatInputForm 
          input={input} 
          isLoading={isLoading} 
          handleInputChange={handleInputChange} 
          handleSubmit={handleSubmit} 
        />
      </SheetContent>
    </Sheet>
  );
}
