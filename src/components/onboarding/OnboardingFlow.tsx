'use client';

import { useState } from 'react';
import { LayoutDashboard, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';
import { ChooseModeCarousel } from './ChooseModeCarousel';
import { ManualSetupCarousel } from './ManualSetupCarousel';
import { PluggySetupCarousel } from './PluggySetupCarousel';
import { TelegramSetupCarousel } from './TelegramSetupCarousel';
import { useFinishOnboarding } from './useFinishOnboarding';

type Phase = 'choose' | 'setup' | 'telegram';

type OnboardingFlowProps = {
  initialMode: DataMode | null;
  telegramLinked: boolean;
};

export function OnboardingFlow({ initialMode, telegramLinked }: OnboardingFlowProps) {
  const [mode, setMode] = useState<DataMode | null>(initialMode);
  const [phase, setPhase] = useState<Phase>(initialMode ? 'setup' : 'choose');
  const finishing = useFinishOnboarding();

  const goToTelegram = () => setPhase('telegram');

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-10">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <LayoutDashboard className="h-4 w-4 text-blue-400" />
        Configuração inicial
        <PiggyBank className="h-4 w-4 text-emerald-400" />
      </div>

      {phase === 'choose' ? (
        <ChooseModeCarousel
          currentMode={mode}
          onChosen={(chosen) => {
            setMode(chosen);
            setPhase('setup');
          }}
        />
      ) : null}

      {phase === 'setup' && mode === 'manual' ? <ManualSetupCarousel onDone={goToTelegram} /> : null}
      {phase === 'setup' && mode === 'pluggy' ? <PluggySetupCarousel onDone={goToTelegram} /> : null}

      {phase === 'telegram' ? (
        <TelegramSetupCarousel
          telegramLinked={telegramLinked}
          onDone={finishing.finish}
          pending={finishing.isPending}
        />
      ) : null}

      {finishing.error ? <p className="text-xs text-red-400">{finishing.error}</p> : null}

      {phase !== 'choose' ? (
        <Button variant="link" size="sm" className="text-xs text-zinc-500" onClick={() => setPhase('choose')}>
          Trocar a fonte de dados escolhida
        </Button>
      ) : null}
    </div>
  );
}
