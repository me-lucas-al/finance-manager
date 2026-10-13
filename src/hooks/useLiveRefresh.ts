'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const POLL_INTERVAL_MS = 10_000;
const AUTH_PATH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];

type VersionResult = { status: 'ok'; version: string } | { status: 'denied' } | { status: 'failed' };

async function fetchEntriesVersion(): Promise<VersionResult> {
  try {
    const response = await fetch('/api/entries/version', { cache: 'no-store' });
    if (response.status === 401 || response.status === 403) return { status: 'denied' };
    if (!response.ok) return { status: 'failed' };
    const body = (await response.json()) as { version?: string };
    return body.version ? { status: 'ok', version: body.version } : { status: 'failed' };
  } catch {
    return { status: 'failed' };
  }
}

export function useLiveRefresh(): void {
  const router = useRouter();
  const pathname = usePathname();
  const lastVersion = useRef<string | null>(null);
  const isAuthPage = AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (isAuthPage) return;
    let active = true;
    let inFlight = false;
    const timer = setInterval(checkForChanges, POLL_INTERVAL_MS);

    function stop() {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', checkForChanges);
    }

    async function checkForChanges() {
      if (inFlight || document.visibilityState !== 'visible') return;
      inFlight = true;
      const result = await fetchEntriesVersion();
      inFlight = false;
      if (!active) return;
      if (result.status === 'denied') return stop();
      if (result.status !== 'ok') return;
      const changed = lastVersion.current !== null && lastVersion.current !== result.version;
      lastVersion.current = result.version;
      if (changed) router.refresh();
    }

    checkForChanges();
    document.addEventListener('visibilitychange', checkForChanges);

    return stop;
  }, [isAuthPage, router]);
}
