'use client';

import { usePrivacy } from '@/providers/PrivacyProvider';

export function useAmountFormatter(): (value: number) => string {
  const { isPrivate } = usePrivacy();

  return (value: number) => {
    if (isPrivate) return 'R$ •••••';
    const formatted = Math.abs(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return value < 0 ? `R$ -${formatted}` : `R$ ${formatted}`;
  };
}
