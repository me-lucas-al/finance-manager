'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WhatsappQrPanel } from '@/components/whatsapp/WhatsappQrPanel';
import { WhatsappStatusBadge } from '@/components/whatsapp/WhatsappStatusBadge';
import { useWhatsappPairing } from '@/components/whatsapp/useWhatsappPairing';
import { disconnectWhatsapp } from '@/app/actions/whatsapp';

export function WhatsappCard({ initiallyConnected }: { initiallyConnected: boolean }) {
  const [connected, setConnected] = useState(initiallyConnected);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pairing = useWhatsappPairing(() => setConnected(true));
  const pairingInProgress = pairing.status === 'starting' || pairing.status === 'qr';

  const disconnect = () =>
    startTransition(async () => {
      try {
        await disconnectWhatsapp();
        setConnected(false);
        setDisconnectError(null);
      } catch (error) {
        console.error('Failed to disconnect WhatsApp', error);
        setDisconnectError('Não foi possível desconectar. Tente novamente.');
      }
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>WhatsApp</CardTitle>
          <WhatsappStatusBadge connected={connected} />
        </div>
        <CardDescription>Receba no WhatsApp o aviso das novas transações importadas do banco.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">Os avisos chegam na conversa com você mesmo.</p>
            <Button variant="outline" size="sm" disabled={isPending} onClick={disconnect}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Desconectar
            </Button>
          </div>
        ) : pairingInProgress ? (
          <WhatsappQrPanel qrImage={pairing.qrImage} onCancel={pairing.cancel} />
        ) : (
          <Button type="button" onClick={pairing.start}>
            Conectar WhatsApp
          </Button>
        )}
        {pairing.error ? <p className="text-xs text-red-400">{pairing.error}</p> : null}
        {disconnectError ? <p className="text-xs text-red-400">{disconnectError}</p> : null}
      </CardContent>
    </Card>
  );
}
