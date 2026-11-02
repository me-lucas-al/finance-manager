'use client';

import { useState } from 'react';
import { LayoutDashboard, PiggyBank } from 'lucide-react';
import { PluggySetupCarousel } from './PluggySetupCarousel';
import { TelegramSetupCarousel } from './TelegramSetupCarousel';
import { useFinishOnboarding } from './useFinishOnboarding';

type Phase = 'bank' | 'telegram';

export function OnboardingFlow({ telegramLinked }: { telegramLinked: boolean }) {
  const [phase, setPhase] = useState<Phase>('bank');
  const finishing = useFinishOnboarding();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-10">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <LayoutDashboard className="h-4 w-4 text-blue-400" />
        Configuração inicial
        <PiggyBank className="h-4 w-4 text-emerald-400" />
      </div>

      {phase === 'bank' ? <PluggySetupCarousel onDone={() => setPhase('telegram')} /> : null}

      {phase === 'telegram' ? (
        <TelegramSetupCarousel
          telegramLinked={telegramLinked}
          onDone={finishing.finish}
          pending={finishing.isPending}
        />
      ) : null}

      {finishing.error ? <p className="text-xs text-red-400">{finishing.error}</p> : null}
    </div>
  );
}
