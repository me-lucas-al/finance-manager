'use client';

import { useEffect, useRef, useState } from 'react';

export type PairingStatus = 'idle' | 'starting' | 'qr' | 'connected' | 'failed';

type PairingMessage =
  | { type: 'qr'; image: string }
  | { type: 'connected' }
  | { type: 'failed'; reason: string };

const CONNECTION_LOST = 'A conexão com o servidor foi interrompida. Tente novamente.';

export function useWhatsappPairing(onConnected: () => void) {
  const [status, setStatus] = useState<PairingStatus>('idle');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  const close = () => {
    sourceRef.current?.close();
    sourceRef.current = null;
  };

  const fail = (reason: string) => {
    close();
    setError(reason);
    setStatus('failed');
  };

  const handle = (message: PairingMessage) => {
    if (message.type === 'qr') {
      setQrImage(message.image);
      setStatus('qr');
      return;
    }
    if (message.type === 'failed') return fail(message.reason);
    close();
    setStatus('connected');
    onConnected();
  };

  const start = () => {
    close();
    setError(null);
    setQrImage(null);
    setStatus('starting');
    const source = new EventSource('/api/whatsapp/link');
    sourceRef.current = source;
    source.onmessage = (event) => handle(JSON.parse(event.data) as PairingMessage);
    source.onerror = () => fail(CONNECTION_LOST);
  };

  const cancel = () => {
    close();
    setStatus('idle');
    setQrImage(null);
  };

  useEffect(() => close, []);

  return { status, qrImage, error, start, cancel };
}
