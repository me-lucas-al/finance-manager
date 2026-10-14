import type { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface GoalsChatInputProps {
  value: string;
  isPending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function GoalsChatInput({ value, isPending, onChange, onSubmit }: GoalsChatInputProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="flex gap-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ex: quero juntar 5000 para uma viagem até dezembro"
        className="min-h-16 flex-1 resize-none"
        disabled={isPending}
      />
      <Button type="button" onClick={onSubmit} disabled={isPending || !value.trim()}>
        Enviar
      </Button>
    </div>
  );
}
