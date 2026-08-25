'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RANGE_OPTIONS = [
  { value: 'current', label: 'Período Atual' },
  { value: 'last', label: 'Último Período Fechado' },
  { value: 'all', label: 'Todo o Histórico' },
];

export function ReportFilters({ range }: { range: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    router.push(`/reports?${params.toString()}`);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
      <h3 className="tracking-tight text-sm font-medium mb-4">Filtros</h3>
      <Select value={range} onValueChange={(value) => handleChange(value as string)}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
