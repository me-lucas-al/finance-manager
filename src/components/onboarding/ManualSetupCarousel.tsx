'use client';

import { PencilLine, Rocket, ShieldCheck, Wallet } from 'lucide-react';
import { StepCarousel, type CarouselStep } from './StepCarousel';

const STEPS: CarouselStep[] = [
  {
    title: 'Você está no modo Manual',
    icon: PencilLine,
    description: 'Ótimo! Vamos ver rapidinho como registrar suas finanças do seu jeito.',
  },
  {
    title: 'Registre receitas e despesas',
    icon: Wallet,
    description:
      'Na tela "Movimentações" você adiciona lucros, gastos e investimentos. Dê uma categoria a cada um para ver para onde o dinheiro vai.',
  },
  {
    title: 'Ajuste suas regras',
    icon: ShieldCheck,
    description:
      'Em Configurações você define o dia de início do seu período, o limite de gastos e a meta de investimento. O app avisa quando você passar do combinado.',
  },
  {
    title: 'Tudo pronto para registrar',
    icon: Rocket,
    description: 'Falta só um passo opcional: conectar o Telegram para registrar gastos por mensagem.',
  },
];

export function ManualSetupCarousel({ onDone }: { onDone: () => void }) {
  return <StepCarousel steps={STEPS} finishLabel="Continuar" onFinish={onDone} />;
}
