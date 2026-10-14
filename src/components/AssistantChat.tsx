'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputForm } from './ChatInputForm';
import { ChatPanelHeader } from './chat/ChatPanelHeader';
import { ChatTrigger } from './chat/ChatTrigger';

const SCROLL_AREA_CLASSES =
  'flex-1 overflow-y-auto px-5 py-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent';

export function AssistantChat() {
  const [input, setInput] = useState('');
  const { messages, status, sendMessage, loadHistory, clearHistory } = useAssistantChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleOpenChange = (open: boolean) => {
    if (open) loadHistory();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <ChatTrigger />
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-dvh bg-black/60 backdrop-blur-2xl border-white/5 border-l">
        <ChatPanelHeader canClear={messages.length > 0} onClear={clearHistory} />
        <div className={SCROLL_AREA_CLASSES}>
          <ChatMessageList messages={messages} isLoading={isLoading} />
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
