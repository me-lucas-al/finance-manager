'use client';

import { formatCurrency } from '@/lib/format';
import { usePrivacy } from '@/providers/PrivacyProvider';

export function useAmountFormatter(): (value: number) => string {
  const { formatMasked } = usePrivacy();

  return (value: number) => formatMasked(formatCurrency(value));
}
