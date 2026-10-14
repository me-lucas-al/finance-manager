'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrentMonth, monthLabel, shiftMonth } from '@/lib/month';

function buildPeriodOptions() {
  return [
    ...Array.from({ length: 5 }, (_, i) => {
      const month = shiftMonth(getCurrentMonth(), -i);
      return {
        value: month,
        label: i === 0 ? `${monthLabel(month, 'short')} (Atual)` : monthLabel(month, 'short'),
      };
    }),
    { value: 'all', label: 'Todo o Histórico' },
  ];
}

interface ReportFiltersProps {
  period: string;
}

export function ReportFilters({ period }: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodOptions = buildPeriodOptions();

  function handlePeriodChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', value);
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
          <Select
            value={period}
            onValueChange={(val) => {
              if (val) handlePeriodChange(val);
            }}
          >
            <SelectTrigger className="w-full sm:w-52 h-9 bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 rounded-lg">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-[#121318] border-zinc-800 text-zinc-200">
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer hover:bg-zinc-800">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
