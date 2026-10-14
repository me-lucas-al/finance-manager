'use client';

import { useState } from 'react';
import { Landmark, Link2, RefreshCw, ShieldCheck } from 'lucide-react';
import { ConnectBankButton } from './ConnectBankButton';
import { StepCarousel, type CarouselStep } from './StepCarousel';

const CONNECTED_TEXT =
  'Pronto! Receitas, despesas e investimentos estão sendo importados e continuam atualizando automaticamente.';
const PENDING_TEXT =
  'Depois de conectar, o app importa receitas, despesas e investimentos e se atualiza sozinho. Volte ao passo 2 se ainda não conectou.';

export function PluggySetupCarousel({ onDone }: { onDone: () => void }) {
  const [connected, setConnected] = useState(false);

  const steps: CarouselStep[] = [
    {
      title: 'O que é o Pluggy?',
      icon: Landmark,
      description:
        'O Pluggy é a ponte segura (Open Finance regulado pelo Banco Central) entre o seu banco e o app. Ele só lê seus dados — nunca move dinheiro.',
    },
    {
      title: 'Escolha seu banco',
      icon: Link2,
      description:
        'Clique em conectar, escolha sua instituição e entre com seus dados nela. As credenciais ficam com o Pluggy, não com o app.',
      content: <ConnectBankButton onConnected={() => setConnected(true)} />,
    },
    {
      title: 'Autorize o acesso',
      icon: ShieldCheck,
      description:
        'Confirme as permissões que o banco mostrar. Você pode revogar o acesso quando quiser, direto no seu banco.',
    },
    {
      title: connected ? 'Banco conectado! 🎉' : 'Seus dados chegam sozinhos',
      icon: RefreshCw,
      description: connected ? CONNECTED_TEXT : PENDING_TEXT,
    },
  ];

  return (
    <StepCarousel
      steps={steps}
      finishLabel="Continuar"
      onFinish={onDone}
      secondaryLabel="Conectar depois"
      onSecondary={onDone}
    />
  );
}
