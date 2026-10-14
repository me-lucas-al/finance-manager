'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TelegramCodeCard } from './TelegramCodeCard';
import { useTelegramLink } from './useTelegramLink';

type TelegramLinkPanelProps = {
  initiallyLinked?: boolean;
  onLinked?: () => void;
};

export function TelegramLinkPanel({ initiallyLinked = false, onLinked }: TelegramLinkPanelProps) {
  const link = useTelegramLink(initiallyLinked, onLinked);

  if (link.linked) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4 text-emerald-400">
        <CheckCircle2 className="h-6 w-6" />
        <p className="text-sm font-medium">Telegram vinculado com sucesso!</p>
      </div>
    );
  }

  if (!link.code) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Button type="button" onClick={link.generate} disabled={link.isPending} className="gap-2">
          {link.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Gerar meu código
        </Button>
        {link.error ? <p className="text-xs text-red-400">{link.error}</p> : null}
      </div>
    );
  }

  return (
    <TelegramCodeCard
      code={link.code}
      botUsername={link.botUsername}
      expired={link.expired}
      regenerating={link.isPending}
      onRegenerate={link.generate}
    />
  );
}
