'use client';

import { useTransition } from 'react';
import { createInvestment, deleteInvestment, updateInvestment } from '../actions/finance';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/DeleteButton';
import { EntryFormFields } from '@/components/entries/EntryFormFields';
import { EditEntryDialog } from '@/components/entries/EditEntryDialog';
import type { EntryRow } from '@/components/entries/EntryTable';
import { toDatetimeLocalValue } from '@/components/entries/format';

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

export function EditInvestmentButton({ row, types }: { row: EntryRow; types: string[] }) {
  return (
    <EditEntryDialog
      title="Editar Investimento"
      categoryLabel="Tipo"
      categoryFieldName="type"
      categoryOptions={types}
      dateFieldName="date"
      dateLabel="Data do Investimento"
      defaultValues={{
        description: row.description,
        amount: row.amount,
        category: row.category,
        date: toDatetimeLocalValue(row.date),
      }}
      onSubmit={(formData) => updateInvestment(row.id, formData)}
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
      <EntryFormFields
        categoryLabel="Tipo"
        categoryFieldName="type"
        categoryOptions={types}
        dateFieldName="date"
        dateLabel="Data do Investimento"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Adicionar Investimento'}
      </Button>
    </form>
  );
}
