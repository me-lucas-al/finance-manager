import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CreditCard } from '@/modules/finance/domain/models/credit-card';
import { CreditCardFormFields } from './CreditCardFormFields';
import type { CreditCardFormPayload } from './credit-card-form-values';
import { useCreditCardForm } from './useCreditCardForm';

type CreditCardDialogProps = {
  card?: CreditCard;
  pending: boolean;
  error: string | null;
  onSubmit: (payload: CreditCardFormPayload) => void;
  onClose: () => void;
};

export function CreditCardDialog({ card, pending, error, onSubmit, onClose }: CreditCardDialogProps) {
  const { values, setField, parse, formError } = useCreditCardForm(card);

  const submit = () => {
    const payload = parse();
    if (payload) onSubmit(payload);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111216] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>{card ? 'Editar cartão' : 'Novo cartão'}</DialogTitle>
          <DialogDescription>
            Sem dia de fechamento, a fatura aberta considera o mês corrente.
          </DialogDescription>
        </DialogHeader>
        <CreditCardFormFields values={values} onChange={setField} />
        {(formError ?? error) && <p role="alert" className="text-sm text-red-400">{formError ?? error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
          <Button onClick={submit} disabled={pending}>{pending ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
