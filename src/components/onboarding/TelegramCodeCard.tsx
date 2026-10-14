'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COPIED_FEEDBACK_MS = 2000;

type TelegramCodeCardProps = {
  code: string;
  botUsername: string | null;
  expired: boolean;
  regenerating: boolean;
  onRegenerate: () => void;
};

export function TelegramCodeCard({ code, botUsername, expired, regenerating, onRegenerate }: TelegramCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const command = `/start ${code}`;

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const openBot = () => window.open(`https://t.me/${botUsername}?start=${code}`, '_blank', 'noopener,noreferrer');

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">Envie esta mensagem ao bot</p>
        <p className="mt-1 font-mono text-xl font-semibold tracking-widest text-white" data-testid="telegram-command">
          {command}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copyCommand}>
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
        {botUsername ? (
          <Button type="button" size="sm" onClick={openBot}>
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir o bot
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" onClick={onRegenerate} disabled={regenerating}>
          <RefreshCw className="h-3.5 w-3.5" />
          Novo código
        </Button>
      </div>
      {expired ? (
        <p className="text-xs text-amber-400">Esse código expirou. Clique em “Novo código” para gerar outro.</p>
      ) : (
        <p className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Aguardando você enviar o código… (vale por 15 minutos)
        </p>
      )}
    </div>
  );
}
