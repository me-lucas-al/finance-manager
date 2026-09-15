'use client';

import React, { useState } from 'react';
import { Briefcase, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePrivacy } from '@/components/PrivacyProvider';

interface AssetItem {
  id: string;
  name: string;
  bank: 'itau' | 'inter' | 'nubank';
  bankName: string;
  type: string;
  amount: number;
  percentage: number;
}

const mockAssets: AssetItem[] = [
  {
    id: 'asset-1',
    name: 'CDB – ITAU UNIBANCO S.A.',
    bank: 'itau',
    bankName: 'Itaú',
    type: 'CDB',
    amount: 146.01,
    percentage: 76.5,
  },
  {
    id: 'asset-2',
    name: 'CDB – ITAU UNIBANCO S.A.',
    bank: 'itau',
    bankName: 'Itaú',
    type: 'CDB',
    amount: 44.74,
    percentage: 23.5,
  },
  {
    id: 'asset-3',
    name: 'CDB – BANCO INTER S.A',
    bank: 'inter',
    bankName: 'Inter',
    type: 'CDB',
    amount: 0,
    percentage: 0.0,
  },
  {
    id: 'asset-4',
    name: 'CDB – NU FINANCEIRA S.A. – SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO',
    bank: 'nubank',
    bankName: 'Nubank',
    type: 'CDB',
    amount: 0,
    percentage: 0.0,
  },
  {
    id: 'asset-5',
    name: 'CDB – NU FINANCEIRA S.A. – SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO',
    bank: 'nubank',
    bankName: 'Nubank',
    type: 'CDB',
    amount: 0,
    percentage: 0.0,
  },
  {
    id: 'asset-6',
    name: 'CDB – NU FINANCEIRA S.A. – SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO',
    bank: 'nubank',
    bankName: 'Nubank',
    type: 'CDB',
    amount: 0,
    percentage: 0.0,
  },
  {
    id: 'asset-7',
    name: 'CDB – NU FINANCEIRA S.A. – SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO',
    bank: 'nubank',
    bankName: 'Nubank',
    type: 'CDB',
    amount: 0,
    percentage: 0.0,
  },
  {
    id: 'asset-8',
    name: 'CDB – NU FINANCEIRA S.A. – SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO',
    bank: 'nubank',
    bankName: 'Nubank',
    type: 'CDB',
    amount: 0,
    percentage: 0.0,
  },
  {
    id: 'asset-9',
    name: 'CDB – NU FINANCEIRA S.A. – SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO',
    bank: 'nubank',
    bankName: 'Nubank',
    type: 'CDB',
    amount: 0,
    percentage: 0.0,
  },
];

export function AtivosList() {
  const { isPrivate } = usePrivacy();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalAmount = 190.75;

  const formatAmount = (val: number) => {
    if (isPrivate) return 'R$ •••••';
    return `R$ ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Carteira Summary Banner - DARK BLUE ICON PER REQUIREMENT */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-blue-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-semibold text-white text-base">
              Carteira (14 ativos)
            </span>
          </div>

          <div>
            <span className="text-xl font-bold tracking-tight text-emerald-400">
              {formatAmount(totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Renda Fixa Section Card */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            RENDA FIXA
          </span>
          <span className="text-xs font-medium text-zinc-400">
            {formatAmount(totalAmount)}
          </span>
        </div>

        {/* Section Content: Asset Items */}
        <CardContent className="p-0 divide-y divide-zinc-800/50">
          {mockAssets.map((asset) => {
            const isExpanded = expandedId === asset.id;
            return (
              <div key={asset.id} className="transition-colors hover:bg-zinc-800/30">
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : asset.id)}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    {/* Icon */}
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      <TrendingUp className="h-4 w-4 text-zinc-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-zinc-100 truncate max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-2xl">
                        {asset.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                        {asset.bank === 'itau' && (
                          <span className="h-3.5 px-1 bg-[#002f6c] text-white text-[9px] font-bold rounded flex items-center">
                            itaú
                          </span>
                        )}
                        {asset.bank === 'inter' && (
                          <span className="h-3.5 px-1 bg-[#ff7a00] text-white text-[9px] font-bold rounded flex items-center">
                            inter
                          </span>
                        )}
                        {asset.bank === 'nubank' && (
                          <span className="h-3.5 px-1 bg-[#820ad1] text-white text-[9px] font-bold rounded flex items-center">
                            nu
                          </span>
                        )}
                        <span>{asset.bankName} · {asset.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount, percentage & chevron */}
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">
                        {formatAmount(asset.amount)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {asset.percentage.toFixed(1)}%
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-800/40 text-xs text-zinc-400 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-zinc-500 block">Instituição</span>
                      <span className="text-white font-medium">{asset.bankName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Tipo</span>
                      <span className="text-white font-medium">{asset.type}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Status</span>
                      <span className="text-emerald-400 font-medium">
                        {asset.amount > 0 ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Rentabilidade</span>
                      <span className="text-white font-medium">100% CDI</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
