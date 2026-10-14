'use client';

import { useAmountFormatter } from '@/hooks/useAmountFormatter';

interface AmountProps {
  value: number;
  className?: string;
}

export function Amount({ value, className }: AmountProps) {
  const formatAmount = useAmountFormatter();

  return <span className={className}>{formatAmount(value)}</span>;
}
