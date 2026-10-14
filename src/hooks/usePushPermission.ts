'use client';

import { useSyncExternalStore } from 'react';

export type PushPermission = 'unsupported' | 'default' | 'granted' | 'denied';

const subscribeNever = (): (() => void) => () => {};

function readPermission(): PushPermission {
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  return isSupported ? Notification.permission : 'unsupported';
}

export function usePushPermission(): PushPermission {
  return useSyncExternalStore(subscribeNever, readPermission, () => 'default');
}
