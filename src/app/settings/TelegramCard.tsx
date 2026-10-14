'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TelegramLinkPanel } from '@/components/onboarding/TelegramLinkPanel';
import { unlinkTelegram } from '@/app/actions/onboarding';

export function TelegramCard({ initiallyLinked }: { initiallyLinked: boolean }) {
  const [linked, setLinked] = useState(initiallyLinked);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram</CardTitle>
        <CardDescription>Registre gastos e converse com o assistente pelo bot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linked ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-emerald-400">Conta vinculada ao Telegram.</p>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await unlinkTelegram();
                    setLinked(false);
                    setError(null);
                  } catch (err) {
                    console.error('Failed to unlink Telegram', err);
                    setError('Não foi possível desvincular. Tente novamente.');
                  }
                })
              }
            >
              Desvincular
            </Button>
          </div>
        ) : (
          <TelegramLinkPanel onLinked={() => setLinked(true)} />
        )}
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
