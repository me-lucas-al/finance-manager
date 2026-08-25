'use client';

import { useTransition } from 'react';
import { createIncome, deleteIncome, updateIncome } from '../actions/finance';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/DeleteButton';
import { EntryFormFields } from '@/components/entries/EntryFormFields';
import { EditEntryDialog } from '@/components/entries/EditEntryDialog';
import type { EntryRow } from '@/components/entries/EntryTable';
import { toDatetimeLocalValue } from '@/components/entries/format';

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

export function EditIncomeButton({ row, categories }: { row: EntryRow; categories: string[] }) {
  return (
    <EditEntryDialog
      title="Editar Receita"
      categoryLabel="Categoria"
      categoryFieldName="category"
      categoryOptions={categories}
      dateFieldName="receivedAt"
      dateLabel="Data de Recebimento"
      defaultValues={{
        description: row.description,
        amount: row.amount,
        category: row.category,
        date: toDatetimeLocalValue(row.date),
      }}
      onSubmit={(formData) => updateIncome(row.id, formData)}
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
      <EntryFormFields
        categoryLabel="Categoria"
        categoryFieldName="category"
        categoryOptions={categories}
        dateFieldName="receivedAt"
        dateLabel="Data de Recebimento"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Adicionar Receita'}
      </Button>
    </form>
  );
}
