'use client';

import React, { useState } from 'react';
import { Landmark, CreditCard, TrendingUp, ChevronDown, Lock, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePrivacy } from '@/components/PrivacyProvider';

interface OverviewCardsProps {
  bankData?: {
    total: number;
    accounts: Array<{
      id: string;
      bank: 'itau' | 'nubank' | 'inter';
      name: string;
      countText: string;
      amount: number;
      locked?: boolean;
    }>;
  };
  creditCardData?: {
    total: number;
    usedPercentage: number;
    limit: number;
    cards: Array<{
      id: string;
      name: string;
      digits: string;
      amount: number;
    }>;
  };
  investmentsData?: {
    total: number;
    subtitle: string;
    categoryName: string;
    percentage: number;
  };
}

const defaultBankAccounts = [
  {
    id: 'itau-1',
    bank: 'itau' as const,
    name: 'Itaú',
    countText: '1 conta · 99.7%',
    amount: 112.49,
  },
  {
    id: 'nu-1',
    bank: 'nubank' as const,
    name: 'Nubank',
    countText: '1 conta · 0.3%',
    amount: 0.3,
    locked: true,
  },
  {
    id: 'inter-1',
    bank: 'inter' as const,
    name: 'Inter',
    countText: '1 conta · 0.0%',
    amount: 0,
  },
];

const defaultCards = [
  {
    id: 'card-1',
    name: 'GOLD',
    digits: 'xxxx 5981',
    amount: 0,
  },
  {
    id: 'card-2',
    name: 'gold',
    digits: 'xxxx 5786',
    amount: 695.38,
  },
  {
    id: 'card-3',
    name: 'Itaú Click Múltiplo MC Plat',
    digits: 'xxxx 3151',
    amount: 1421.64,
  },
];

export function OverviewCards({
  bankData,
  creditCardData,
  investmentsData,
}: OverviewCardsProps) {
  const { isPrivate } = usePrivacy();
  const [investView, setInvestView] = useState<'classes' | 'instituicoes'>('classes');
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  const bankAccounts = bankData?.accounts || defaultBankAccounts;
  const bankTotal = bankData?.total ?? 112.79;

  const cardList = creditCardData?.cards || defaultCards;
  const cardTotal = creditCardData?.total ?? 2117.02;
  const cardLimit = creditCardData?.limit ?? 6100;
  const cardUsedPct = creditCardData?.usedPercentage ?? 35;

  const investTotal = investmentsData?.total ?? 190.75;

  const formatAmount = (val: number, isCurrency = true) => {
    if (isPrivate) return 'R$ •••••';
    const formatted = val.toLocaleString('pt-BR', {
      minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    });
    return isCurrency ? `R$ ${formatted}` : formatted;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* 1. CONTAS BANCÁRIAS */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
        <CardHeader className="pb-3 pt-5 px-6">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <Landmark className="h-4 w-4 text-zinc-400" />
            <span>CONTAS BANCÁRIAS</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              {formatAmount(bankTotal)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-5 pt-1 space-y-3">
          {bankAccounts.map((acc) => {
            const isExpanded = expandedAccount === acc.id;
            return (
              <div key={acc.id} className="border-t border-zinc-800/50 pt-3 first:border-0 first:pt-0">
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => setExpandedAccount(isExpanded ? null : acc.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Bank Badge */}
                    {acc.bank === 'itau' && (
                      <div className="h-7 w-7 rounded-md bg-[#002f6c] flex items-center justify-center font-bold text-[10px] text-white">
                        itaú
                      </div>
                    )}
                    {acc.bank === 'nubank' && (
                      <div className="h-7 w-7 rounded-md bg-[#820ad1] flex items-center justify-center font-bold text-[11px] text-white">
                        nu
                      </div>
                    )}
                    {acc.bank === 'inter' && (
                      <div className="h-7 w-7 rounded-md bg-[#ff7a00] flex items-center justify-center font-bold text-[10px] text-white">
                        inter
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white group-hover:text-zinc-200">
                          {acc.name}
                        </span>
                        {acc.locked && (
                          <Lock className="h-3 w-3 text-amber-500/80" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{acc.countText}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-400">
                      {formatAmount(acc.amount)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 pl-10 pr-2 py-1.5 text-xs text-zinc-400 bg-zinc-900/40 rounded-lg">
                    <span>Conta Corrente ativa · Sincronizado via Open Finance</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 2. CARTÕES DE CRÉDITO - DARK BLUE ACCENT (REPLACED FROM RED) */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
        <CardHeader className="pb-3 pt-5 px-6">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span>CARTÕES DE CRÉDITO</span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-blue-500">
              {formatAmount(cardTotal)}
            </span>
          </div>

          {/* Usage Limit Bar - DARK BLUE */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{cardUsedPct}% utilizado</span>
              <span>Limite: {formatAmount(cardLimit)}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${cardUsedPct}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-5 pt-1 space-y-3">
          {cardList.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-t border-zinc-800/50 pt-3 first:border-0 first:pt-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-md bg-zinc-800/80 flex items-center justify-center border border-zinc-700/40">
                  <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-zinc-500">{c.digits}</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-semibold text-blue-500">
                  {formatAmount(c.amount)}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. INVESTIMENTOS */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
        <CardHeader className="pb-3 pt-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>INVESTIMENTOS</span>
            </div>

            {/* Toggle Pills: Classes (Dark Blue active) | Instituições */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setInvestView('classes')}
                className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                  investView === 'classes'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Classes
              </button>
              <button
                onClick={() => setInvestView('instituicoes')}
                className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                  investView === 'instituicoes'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Instituições
              </button>
            </div>
          </div>

          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-400">
              {formatAmount(investTotal)}
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-1">
            {investView === 'classes'
              ? '1 classes · 14 ativos (2 ativos, 12 inativos)'
              : '3 instituições · 14 ativos'}
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-5 pt-3">
          {investView === 'classes' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="font-medium">Renda Fixa (14)</span>
                <span className="font-medium">100.0% {formatAmount(investTotal)}</span>
              </div>
              {/* Progress Bar - DARK BLUE per requirement */}
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Itaú (2 ativos)</span>
                <span>{formatAmount(190.75)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Inter (1 ativo)</span>
                <span>{formatAmount(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Nubank (11 ativos)</span>
                <span>{formatAmount(0)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
