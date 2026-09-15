'use client';

import { useId, useRef, useState, useTransition } from 'react';
import { saveMonthlyGoals, sendGoalsChatMessage } from '@/app/actions/goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface GoalsFormProps {
  month: string;
  categories: string[];
  generalTargetAmount: number | null;
  categoryTargets: Record<string, number | null>;
}

export function GoalsForm({ month, categories, generalTargetAmount, categoryTargets }: GoalsFormProps) {
  const [isPending, startTransition] = useTransition();
  const uid = useId();

  function action(formData: FormData) {
    startTransition(() => saveMonthlyGoals(month, formData));
  }

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={`${uid}-general`}>Meta geral (quanto pretende gastar no total)</Label>
        <Input
          id={`${uid}-general`}
          name="general"
          type="number"
          step="0.01"
          placeholder="Ex: 4000"
          defaultValue={generalTargetAmount ?? undefined}
        />
      </div>

      {categories.length > 0 && (
        <div className="space-y-2">
          <Label>Metas por categoria (opcional)</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category} className="space-y-1">
                <Label htmlFor={`${uid}-${category}`} className="text-xs text-muted-foreground">
                  {category}
                </Label>
                <Input
                  id={`${uid}-${category}`}
                  name={`category__${category}`}
                  type="number"
                  step="0.01"
                  defaultValue={categoryTargets[category] ?? undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar metas'}
      </Button>
    </form>
  );
}

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

// Website counterpart of the Telegram bot's free-text /goal replies: type
// what you want to set or update (no command prefix needed here — this box
// only ever talks about goals) and Gemini interprets it the same way.
export function GoalsChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Me conte o que quer definir ou atualizar: teto de gasto do mês, meta por categoria, valor guardado para algum objetivo, ou um novo objetivo com prazo.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const nextId = useRef(1);

  function handleSubmit() {
    const text = input.trim();
    if (!text || isPending) return;

    setMessages((prev) => [...prev, { id: nextId.current++, role: 'user', text }]);
    setInput('');

    startTransition(async () => {
      const confirmation = await sendGoalsChatMessage(text);
      setMessages((prev) => [...prev, { id: nextId.current++, role: 'assistant', text: confirmation }]);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ScrollArea className="h-72 rounded-lg border border-zinc-800/80 bg-[#09090b] p-3">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-zinc-800/80 text-zinc-100',
              )}
            >
              {message.text}
            </div>
          ))}
          {isPending && <div className="max-w-[85%] rounded-lg bg-zinc-800/80 px-3 py-2 text-sm text-zinc-400">Pensando...</div>}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ex: quero juntar 5000 para uma viagem até dezembro"
          className="min-h-16 flex-1 resize-none"
          disabled={isPending}
        />
        <Button type="button" onClick={handleSubmit} disabled={isPending || !input.trim()}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
