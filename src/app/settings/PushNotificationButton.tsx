'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPushPublicKey } from '@/app/actions/push';
import { usePushPermission } from '@/hooks/usePushPermission';
import { subscribeToPush } from '@/services/push-service';

type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied' | 'subscribed';
type StatusOverride = PermissionState | null;

export function PushNotificationButton() {
  const browserPermission = usePushPermission();
  const [override, setStatus] = useState<StatusOverride>(null);
  const status: PermissionState = override ?? browserPermission;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await subscribeToPush(publicKey);

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
      <div className="flex items-center gap-2 text-sm text-positive">
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
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
