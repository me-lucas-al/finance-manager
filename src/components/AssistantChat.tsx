'use client';

import React, { useState } from 'react';
import { Bot } from 'lucide-react';
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Abrir assistente financeiro"
      >
        <Bot className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-[#09090b] border-zinc-800 border-l">
        <SheetHeader className="p-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-500">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-zinc-100 text-lg">Finance AI</SheetTitle>
              <p className="text-xs text-zinc-400">Seu assistente financeiro pessoal</p>
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
