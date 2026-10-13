'use client';

import { useLiveRefresh } from '@/hooks/useLiveRefresh';

export function LiveRefresh() {
  useLiveRefresh();
  return null;
}
