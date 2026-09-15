'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
  formatMasked: (formattedValue: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivate: false,
  togglePrivacy: () => {},
  formatMasked: (val) => val,
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('finance_manager_privacy_mode');
    if (saved !== null) {
      setIsPrivate(saved === 'true');
    }
  }, []);

  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      const next = !prev;
      localStorage.setItem('finance_manager_privacy_mode', String(next));
      return next;
    });
  };

  const formatMasked = (formattedValue: string) => {
    if (!isPrivate) return formattedValue;
    return 'R$ •••••';
  };

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, formatMasked }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
