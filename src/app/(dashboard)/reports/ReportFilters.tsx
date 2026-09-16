'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Landmark, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatMonthLabel, getCurrentMonth, shiftMonth } from './month-format';

const PERIOD_OPTIONS = [
  ...Array.from({ length: 5 }, (_, i) => {
    const month = shiftMonth(getCurrentMonth(), -i);
    return {
      value: month,
      label: i === 0 ? `${formatMonthLabel(month)} (Atual)` : formatMonthLabel(month),
    };
  }),
  { value: 'all', label: 'Todo o Histórico' },
];

const BANK_OPTIONS = [
  { value: 'all', label: 'Todas as Instituições' },
  { value: 'itau', label: 'Itaú' },
  { value: 'nubank', label: 'Nubank' },
  { value: 'inter', label: 'Inter' },
];

interface ReportFiltersProps {
  period: string;
  bank: string;
}

export function ReportFilters({ period, bank }: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilterChange(key: 'period' | 'bank', value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/reports?${params.toString()}`);
  }

  return (
    <div className="bg-[#111216] border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Filtros do Relatório
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Período */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
            <Select
              value={period}
              onValueChange={(val) => {
                if (val) handleFilterChange('period', val);
              }}
            >
              <SelectTrigger className="w-full sm:w-52 h-9 bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 rounded-lg">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent className="bg-[#121318] border-zinc-800 text-zinc-200">
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer hover:bg-zinc-800">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instituição */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Landmark className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
            <Select
              value={bank}
              onValueChange={(val) => {
                if (val) handleFilterChange('bank', val);
              }}
            >
              <SelectTrigger className="w-full sm:w-48 h-9 bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 rounded-lg">
                <SelectValue placeholder="Instituição" />
              </SelectTrigger>
              <SelectContent className="bg-[#121318] border-zinc-800 text-zinc-200">
                {BANK_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer hover:bg-zinc-800">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
