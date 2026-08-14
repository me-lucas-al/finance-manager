'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { saveSubscriptionAction, removeSubscriptionAction } from '@/app/actions/push';
import { urlBase64ToUint8Array } from '@/shared/lib/utils';

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkSubscription() {
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js');
        }
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (supported) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(true);
    }

    if (supported) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  async function subscribeToPush() {
    setError('');
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permisso de notificao negada.');
      }

      const registration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error('VAPID Key ausente');

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      setSubscription(sub);
      
      const subJson = sub.toJSON();
      await saveSubscriptionAction({
        endpoint: subJson.endpoint ?? '',
        keys: (subJson.keys as { p256dh: string; auth: string; }) ?? { p256dh: '', auth: '' },
      });

    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Falha ao assinar notificaes');
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setError('');
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await removeSubscriptionAction(sub.endpoint);
        setSubscription(null);
      }
    } catch {
      setError('Falha ao cancelar assinatura');
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return <div className="text-sm text-muted-foreground">O seu navegador no suporta notificaes push.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Notificaes neste dispositivo</h3>
          <p className="text-sm text-muted-foreground">
            {subscription ? 'As notificaes esto ativadas neste dispositivo.' : 'Ative para receber alertas no seu navegador.'}
          </p>
        </div>
        <Button 
          variant={subscription ? 'destructive' : 'default'} 
          onClick={subscription ? unsubscribeFromPush : subscribeToPush}
          disabled={loading}
        >
          {loading ? 'Aguarde...' : subscription ? 'Desativar' : 'Ativar'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
