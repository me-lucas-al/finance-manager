'use client';

import { useRef, useState, useTransition } from 'react';
import { sendGoalsChatMessage } from '@/app/actions/goals';
import type { GoalsChatMessage } from '@/types/goals';
import { GoalsChatInput } from './GoalsChatInput';
import { GoalsChatMessages } from './GoalsChatMessages';

const WELCOME_MESSAGE: GoalsChatMessage = {
  id: 0,
  role: 'assistant',
  text: 'Me conte o que quer definir ou atualizar: teto de gasto do mês, meta por categoria, valor guardado para algum objetivo, ou um novo objetivo com prazo.',
};

export function GoalsChat() {
  const [messages, setMessages] = useState<GoalsChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const nextId = useRef(1);

  function appendMessage(role: GoalsChatMessage['role'], text: string) {
    setMessages((previous) => [...previous, { id: nextId.current++, role, text }]);
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || isPending) return;

    appendMessage('user', text);
    setInput('');

    startTransition(async () => {
      appendMessage('assistant', await sendGoalsChatMessage(text));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <GoalsChatMessages messages={messages} isPending={isPending} />
      <GoalsChatInput value={input} isPending={isPending} onChange={setInput} onSubmit={handleSubmit} />
    </div>
  );
}
