'use client';

import { useRouter } from 'next/navigation';
import { ConnectBankButton } from '@/components/onboarding/ConnectBankButton';

export function ConnectAnotherBank({ hasBanks }: { hasBanks: boolean }) {
  const router = useRouter();
  return (
    <ConnectBankButton
      label={hasBanks ? 'Conectar outro banco' : 'Conectar meu banco'}
      onConnected={() => router.refresh()}
    />
  );
}
