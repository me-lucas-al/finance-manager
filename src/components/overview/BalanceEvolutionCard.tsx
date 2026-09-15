'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { BalanceEvolutionChart } from './BalanceEvolutionChart';

interface BalanceEvolutionCardProps {
  balance?: number;
}

export function BalanceEvolutionCard({ balance = 2229.81 }: BalanceEvolutionCardProps) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          <Wallet className="h-4 w-4 text-zinc-400" />
          <span>EVOLUÇÃO DO SALDO</span>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <BalanceEvolutionChart initialBalance={balance} />
      </CardContent>
    </Card>
  );
}
