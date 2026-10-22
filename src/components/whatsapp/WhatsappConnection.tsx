'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
import { disconnectWhatsapp } from '@/app/actions/whatsapp';
import { WhatsappConnectDialog } from './WhatsappConnectDialog';
import { useWhatsappPairing } from './useWhatsappPairing';

export function WhatsappConnection({ initiallyConnected }: { initiallyConnected: boolean }) {
  const [connected, setConnected] = useState(initiallyConnected);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pairing = useWhatsappPairing(() => setConnected(true));

  const openDialog = () => {
    setDialogOpen(true);
    pairing.start();
  };

  const closeDialog = () => {
    pairing.cancel();
    setDialogOpen(false);
  };

  const disconnect = () =>
    startTransition(async () => {
      try {
        await disconnectWhatsapp();
        setConnected(false);
        setError(null);
      } catch (failure) {
        console.error('Failed to disconnect WhatsApp', failure);
        setError('Não foi possível desconectar. Tente novamente.');
      }
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <ConnectionBadge connected={connected} />
        {connected ? (
          <Button variant="outline" size="sm" disabled={isPending} onClick={disconnect}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Desconectar
          </Button>
        ) : (
          <Button size="sm" onClick={openDialog}>
            Conectar WhatsApp
          </Button>
        )}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <WhatsappConnectDialog
        open={dialogOpen}
        status={pairing.status}
        qrImage={pairing.qrImage}
        error={pairing.error}
        onClose={closeDialog}
        onRetry={pairing.start}
      />
    </div>
  );
}
