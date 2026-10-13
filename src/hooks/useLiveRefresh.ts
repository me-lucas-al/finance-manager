'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const POLL_INTERVAL_MS = 10_000;
const AUTH_PATH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];

async function fetchEntriesVersion(): Promise<string | null> {
  try {
    const response = await fetch('/api/entries/version', { cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as { version?: string };
    return body.version ?? null;
  } catch {
    return null;
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

    async function checkForChanges() {
      if (document.visibilityState !== 'visible') return;
      const version = await fetchEntriesVersion();
      if (!active || version === null) return;
      const changed = lastVersion.current !== null && lastVersion.current !== version;
      lastVersion.current = version;
      if (changed) router.refresh();
    }

    checkForChanges();
    const timer = setInterval(checkForChanges, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', checkForChanges);

    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', checkForChanges);
    };
  }, [isAuthPage, router]);
}
