'use client';

import { useState } from 'react';
import { Bell, BotMessageSquare, CheckCircle2, MessageCircle, ScanSearch } from 'lucide-react';
import { StepCarousel, type CarouselStep } from './StepCarousel';
import { TelegramLinkPanel } from './TelegramLinkPanel';

type TelegramSetupCarouselProps = {
  telegramLinked: boolean;
  onDone: () => void;
  pending: boolean;
};

export function TelegramSetupCarousel({ telegramLinked, onDone, pending }: TelegramSetupCarouselProps) {
  const [linked, setLinked] = useState(telegramLinked);

  const steps: CarouselStep[] = [
    {
      title: 'Seu assistente no Telegram',
      icon: BotMessageSquare,
      description:
        'Com o bot você registra gastos por mensagem, recebe alertas de orçamento, resumos semanais e conversa com um consultor financeiro de IA. É opcional.',
    },
    {
      title: 'O que o bot faz por você',
      icon: Bell,
      description:
        'Escreva "gastei 45 no mercado" e ele registra. Pergunte "quanto gastei esse mês?" e ele responde com base nos seus dados.',
    },
    {
      title: 'Gere seu código e vincule',
      icon: MessageCircle,
      description:
        'Gere um código, abra o bot no Telegram e envie a mensagem mostrada. Pronto: seu chat fica ligado à sua conta.',
      content: <TelegramLinkPanel initiallyLinked={telegramLinked} onLinked={() => setLinked(true)} />,
    },
    {
      title: linked ? 'Telegram conectado!' : 'Quase lá',
      icon: linked ? CheckCircle2 : ScanSearch,
      description: linked
        ? 'Tudo certo. Você já pode mandar mensagens para o bot.'
        : 'Você pode vincular agora ou depois, em Configurações → Telegram.',
    },
  ];

  return (
    <StepCarousel
      steps={steps}
      finishLabel="Concluir e entrar no app"
      onFinish={onDone}
      finishPending={pending}
      secondaryLabel={linked ? undefined : 'Pular por agora'}
      onSecondary={onDone}
    />
  );
}
