'use client';

import { useId, useState, useTransition } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateTransactionCategorization } from '@/app/actions/transactions';

interface EditTransactionDialogProps {
  transactionId: string;
  categories: string[];
  defaultCategory: string;
  defaultReason: string;
}

export function EditTransactionDialog({
  transactionId,
  categories,
  defaultCategory,
  defaultReason,
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const uid = useId();

  async function action(formData: FormData) {
    await updateTransactionCategorization(transactionId, formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar categoria e motivo</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Categoria e motivo</DialogTitle>
        </DialogHeader>
        <form action={(data) => startTransition(() => action(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-category`}>Categoria</Label>
            <Select name="category" defaultValue={defaultCategory}>
              <SelectTrigger id={`${uid}-category`} className="w-full">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-reason`}>Motivo</Label>
            <Textarea id={`${uid}-reason`} name="reason" defaultValue={defaultReason} rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
