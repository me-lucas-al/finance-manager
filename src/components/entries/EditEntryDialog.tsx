'use client';

import { useState, useTransition } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EntryFormFields, type EntryFormDefaultValues } from './EntryFormFields';

interface EditEntryDialogProps {
  title: string;
  categoryLabel: string;
  categoryFieldName: string;
  categoryOptions: string[];
  dateFieldName: string;
  dateLabel: string;
  defaultValues: EntryFormDefaultValues;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function EditEntryDialog({
  title,
  categoryLabel,
  categoryFieldName,
  categoryOptions,
  dateFieldName,
  dateLabel,
  defaultValues,
  onSubmit,
}: EditEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    await onSubmit(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form action={(data) => startTransition(() => action(data))} className="space-y-4">
          <EntryFormFields
            categoryLabel={categoryLabel}
            categoryFieldName={categoryFieldName}
            categoryOptions={categoryOptions}
            dateFieldName={dateFieldName}
            dateLabel={dateLabel}
            defaultValues={defaultValues}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
