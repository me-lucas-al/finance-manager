'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { createExpense, updateExpense } from '@/modules/expenses/presentation/actions/expenseActions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que 0'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
});

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  periodId: string;
};

interface ExpenseFormDialogProps {
  expense?: Expense;
  periodId: string;
  categories: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ExpenseFormDialog({ expense, periodId, categories, open: controlledOpen, onOpenChange }: ExpenseFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled && onOpenChange ? onOpenChange : setUncontrolledOpen;

  const isEditing = !!expense;

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as unknown as any,
    defaultValues: {
      description: expense?.description || '',
      amount: expense ? expense.amount / 100 : 0,
      category: expense?.category || '',
      date: expense ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        periodId,
        description: values.description,
        amount: Math.round(values.amount * 100), // convert to cents
        category: values.category,
        date: new Date(values.date).toISOString(),
      };

      if (isEditing) {
        await updateExpense(expense.id, dataToSubmit);
      } else {
        await createExpense(dataToSubmit);
      }

      setOpen(false);
      if (!isEditing) {
        form.reset();
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      // In a real app, use a toast to show the error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Despesa' : 'Adicionar Despesa'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Supermercado, Aluguel, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
