'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Period = {
  id: string;
  startDate: Date;
  endDate: Date;
};

interface ReportsFiltersProps {
  periods: Period[];
}

export function ReportsFilters({ periods }: ReportsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPeriod = searchParams.get('periodId') || '';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';
  const currentCategory = searchParams.get('category') || '';

  const [periodId, setPeriodId] = useState(currentPeriod);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [category, setCategory] = useState(currentCategory);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (periodId && periodId !== 'custom') {
      params.set('periodId', periodId);
      params.delete('startDate');
      params.delete('endDate');
    } else {
      params.delete('periodId');
      if (startDate) params.set('startDate', startDate);
      else params.delete('startDate');

      if (endDate) params.set('endDate', endDate);
      else params.delete('endDate');
    }

    if (category) params.set('category', category);
    else params.delete('category');

    router.push(`/reports?${params.toString()}`);
  }, [periodId, startDate, endDate, category, router, searchParams]);

  const clearFilters = useCallback(() => {
    setPeriodId('');
    setStartDate('');
    setEndDate('');
    setCategory('');
    router.push('/reports');
  }, [router]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end mb-8 p-4 border rounded-lg bg-card text-card-foreground">
      <div className="flex flex-col gap-2 w-full md:w-auto min-w-[200px]">
        <Label htmlFor="period">Período</Label>
        <Select value={periodId} onValueChange={(val) => { setPeriodId(val); if (val !== 'custom') { setStartDate(''); setEndDate(''); } }}>
          <SelectTrigger id="period">
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Personalizado</SelectItem>
            {periods.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {new Date(p.startDate).toLocaleDateString('pt-BR')} até {new Date(p.endDate).toLocaleDateString('pt-BR')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-auto">
        <Label htmlFor="startDate">Data Inicial</Label>
        <Input 
          id="startDate" 
          type="date" 
          value={startDate} 
          disabled={periodId !== 'custom' && periodId !== ''}
          onChange={(e) => { setStartDate(e.target.value); setPeriodId('custom'); }} 
        />
      </div>
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <Label htmlFor="endDate">Data Final</Label>
        <Input 
          id="endDate" 
          type="date" 
          value={endDate} 
          disabled={periodId !== 'custom' && periodId !== ''}
          onChange={(e) => { setEndDate(e.target.value); setPeriodId('custom'); }} 
        />
      </div>
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <Label htmlFor="category">Categoria</Label>
        <Input 
          id="category" 
          type="text" 
          placeholder="Ex: Alimentação"
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Button onClick={applyFilters}>Filtrar</Button>
        <Button variant="outline" onClick={clearFilters}>Limpar</Button>
      </div>
    </div>
  );
}
