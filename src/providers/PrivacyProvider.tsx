'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { readPrivacy, readServerPrivacy, subscribePrivacy, writePrivacy } from './privacy-store';

const MASKED_AMOUNT = 'R$ •••••';

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
  formatMasked: (formattedValue: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivate: false,
  togglePrivacy: () => {},
  formatMasked: (value) => value,
});

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const isPrivate = useSyncExternalStore(subscribePrivacy, readPrivacy, readServerPrivacy);

  const togglePrivacy = useCallback(() => writePrivacy(!readPrivacy()), []);

  const value = useMemo<PrivacyContextType>(
    () => ({
      isPrivate,
      togglePrivacy,
      formatMasked: (formattedValue) => (isPrivate ? MASKED_AMOUNT : formattedValue),
    }),
    [isPrivate, togglePrivacy],
  );

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
