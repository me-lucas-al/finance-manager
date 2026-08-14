'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type Period = {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
};

interface InvestmentsFiltersProps {
  periods: Period[];
  types: string[];
  selectedPeriodId?: string;
}

export function InvestmentsFilters({ periods, types, selectedPeriodId }: InvestmentsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set('page', '1'); // reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        router.push(`?${createQueryString('search', search)}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, router, createQueryString, searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 w-full">
        <Input 
          placeholder="Buscar investimentos..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
        <Select 
          value={selectedPeriodId || 'all'} 
          onValueChange={(val) => router.push(`?${createQueryString('periodId', val === 'all' ? '' : val)}`)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Períodos</SelectItem>
            {periods.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                {p.status === 'open' ? ' (Atual)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={searchParams.get('type') || 'all'} 
          onValueChange={(val) => router.push(`?${createQueryString('type', val === 'all' ? '' : val)}`)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {types.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={searchParams.get('sort') || 'date_desc'} 
          onValueChange={(val) => router.push(`?${createQueryString('sort', val)}`)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Data (Mais recente)</SelectItem>
            <SelectItem value="date_asc">Data (Mais antiga)</SelectItem>
            <SelectItem value="amount_desc">Valor (Maior)</SelectItem>
            <SelectItem value="amount_asc">Valor (Menor)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
