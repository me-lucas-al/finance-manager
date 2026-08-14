'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteExpense } from '@/modules/expenses/presentation/actions/expenseActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Expense = {
  id: string;
  description: string;
};

interface DeleteExpenseDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteExpenseDialog({ expense, open, onOpenChange }: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      onOpenChange(false);
      toast.success('Despesa excluída com sucesso!');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao excluir a despesa. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso excluirá permanentemente a despesa &quot;{expense.description}&quot;. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
