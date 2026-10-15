import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { CreditCard } from '@/modules/finance/domain/models/credit-card';

type CreditCardDeleteDialogProps = {
  card: CreditCard;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function CreditCardDeleteDialog({ card, pending, error, onConfirm, onClose }: CreditCardDeleteDialogProps) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#111216] border-zinc-800 text-zinc-100">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {card.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            As despesas já lançadas neste cartão continuam no Fluxo, apenas sem o vínculo com o cartão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
