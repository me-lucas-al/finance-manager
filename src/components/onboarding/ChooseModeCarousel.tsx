'use client';

import { Landmark, PencilLine, Sparkles, Wallet } from 'lucide-react';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';
import { ModePicker } from './ModePicker';
import { StepCarousel, type CarouselStep } from './StepCarousel';
import { useChooseMode } from './useChooseMode';

type ChooseModeCarouselProps = {
  currentMode: DataMode | null;
  onChosen: (mode: DataMode) => void;
};

export function ChooseModeCarousel({ currentMode, onChosen }: ChooseModeCarouselProps) {
  const choice = useChooseMode(currentMode, onChosen);

  const steps: CarouselStep[] = [
    {
      title: 'Bem-vindo ao Finance Manager',
      icon: Sparkles,
      description:
        'Antes de começar, você vai escolher como seus lucros, despesas e investimentos chegam até aqui. Leva 2 minutos e você pode mudar depois.',
    },
    {
      title: 'Opção 1 · Manual',
      icon: PencilLine,
      description:
        'Você registra cada receita, gasto e investimento por conta própria, direto no app ou mandando uma mensagem pelo Telegram (ex.: "gastei 30 no almoço"). Você controla tudo e não precisa conectar nenhum banco.',
    },
    {
      title: 'Opção 2 · Pluggy (Open Finance)',
      icon: Landmark,
      description:
        'Você conecta sua conta bancária de forma segura pelo Pluggy e o app importa sozinho receitas, despesas e investimentos. Menos trabalho, mas depende da conexão com o banco.',
    },
    {
      title: 'Qual combina mais com você?',
      icon: Wallet,
      description: 'Compare e escolha. Se mudar de ideia, os dados do outro modo serão apagados e você recomeça do zero.',
      content: (
        <ModePicker
          selected={choice.selected}
          onSelect={choice.setSelected}
          showWarning={choice.needsWarning}
          acknowledged={choice.acknowledged}
          onAcknowledge={choice.setAcknowledged}
          error={choice.error}
        />
      ),
    },
  ];

  return (
    <StepCarousel
      steps={steps}
      finishLabel="Continuar"
      finishDisabled={!choice.canSubmit}
      finishPending={choice.isPending}
      onFinish={choice.submit}
    />
  );
}
