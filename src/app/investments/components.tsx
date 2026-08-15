'use client';

import { useTransition } from 'react';
import { createInvestment, deleteInvestment } from '../actions/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DeleteButton } from '@/components/DeleteButton';

export function DeleteInvestmentButton({ id }: { id: string }) {
  return (
    <DeleteButton 
      itemType="investimento" 
      onDelete={async () => {
        await deleteInvestment(id);
      }} 
    />
  );
}

export function InvestmentForm({ types }: { types: string[] }) {
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    await createInvestment(formData);
  }

  return (
    <form action={(data) => startTransition(() => action(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" name="description" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select name="type">
          <SelectTrigger id="type" className="w-full">
            <SelectValue placeholder="Selecione um tipo" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Data do Investimento</Label>
        <Input id="date" name="date" type="datetime-local" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Adicionar Investimento'}
      </Button>
    </form>
  );
}
