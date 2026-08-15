'use client';

import { useTransition } from 'react';
import { createIncome, deleteIncome } from '../actions/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DeleteButton } from '@/components/DeleteButton';

export function DeleteIncomeButton({ id }: { id: string }) {
  return (
    <DeleteButton 
      itemType="receita" 
      onDelete={async () => {
        await deleteIncome(id);
      }} 
    />
  );
}

export function IncomeForm({ categories }: { categories: string[] }) {
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    await createIncome(formData);
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
        <Label htmlFor="category">Categoria</Label>
        <Select name="category">
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="receivedAt">Data de Recebimento</Label>
        <Input id="receivedAt" name="receivedAt" type="datetime-local" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Adicionar Receita'}
      </Button>
    </form>
  );
}
