'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPushPublicKey } from '@/app/actions/push';

type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied' | 'subscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationButton() {
  const [status, setStatus] = useState<PermissionState>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    const initialStatus: PermissionState = !isSupported
      ? 'unsupported'
      : Notification.permission === 'granted'
        ? 'granted'
        : Notification.permission === 'denied'
          ? 'denied'
          : 'default';
    // Notification/PushManager only exist in the browser, so the real status
    // can only be read after mount — this sync-on-mount effect is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(initialStatus);
  }, []);

  async function enablePush() {
    setError(null);
    setIsLoading(true);
    try {
      const publicKey = await getPushPublicKey();
      if (!publicKey) {
        setError('Push notifications não estão configuradas no servidor.');
        return;
      }

      const permission = await Notification.requestPermission();
      setStatus(permission === 'granted' ? 'granted' : 'denied');
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error('Falha ao salvar inscrição');

      setStatus('subscribed');
    } catch {
      setError('Não foi possível ativar as notificações push.');
    } finally {
      setIsLoading(false);
    }
  }

  if (status === 'unsupported') {
    return <p className="text-sm text-muted-foreground">Seu navegador não suporta notificações push.</p>;
  }

  if (status === 'granted' || status === 'subscribed') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Bell className="h-4 w-4" /> Notificações push ativadas neste dispositivo.
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="h-4 w-4" /> Permissão negada. Ative nas configurações do navegador.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={enablePush} disabled={isLoading}>
        <Bell className="h-4 w-4" /> {isLoading ? 'Ativando...' : 'Ativar notificações push neste dispositivo'}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
