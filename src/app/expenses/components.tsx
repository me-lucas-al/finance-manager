'use client';

import { useTransition } from 'react';
import { createExpense, deleteExpense, updateExpense } from '../actions/finance';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/DeleteButton';
import { EntryFormFields } from '@/components/entries/EntryFormFields';
import { EditEntryDialog } from '@/components/entries/EditEntryDialog';
import type { EntryRow } from '@/components/entries/EntryTable';
import { toDatetimeLocalValue } from '@/components/entries/format';

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

export function EditExpenseButton({ row, categories }: { row: EntryRow; categories: string[] }) {
  return (
    <EditEntryDialog
      title="Editar Despesa"
      categoryLabel="Categoria"
      categoryFieldName="category"
      categoryOptions={categories}
      dateFieldName="date"
      dateLabel="Data"
      defaultValues={{
        description: row.description,
        amount: row.amount,
        category: row.category,
        date: toDatetimeLocalValue(row.date),
      }}
      onSubmit={(formData) => updateExpense(row.id, formData)}
    />
  );
}

export function ExpenseForm({ categories }: { categories: string[] }) {
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    await createExpense(formData);
  }

  return (
    <form action={(data) => startTransition(() => action(data))} className="space-y-4">
      <EntryFormFields
        categoryLabel="Categoria"
        categoryFieldName="category"
        categoryOptions={categories}
        dateFieldName="date"
        dateLabel="Data"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Adicionar Despesa'}
      </Button>
    </form>
  );
}
