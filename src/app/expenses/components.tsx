'use client';

import { useTransition } from 'react';
import { createExpense, deleteExpense } from '../actions/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { DeleteButton } from '@/components/DeleteButton';

export function DeleteExpenseButton({ id }: { id: string }) {
  return (
    <DeleteButton 
      itemType="despesa" 
      onDelete={async () => {
        await deleteExpense(id);
      }} 
    />
  );
}
export function ExpenseForm() {
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    await createExpense(formData);
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
        <Input id="category" name="category" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input id="date" name="date" type="datetime-local" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Adicionar Despesa'}
      </Button>
    </form>
  );
}
