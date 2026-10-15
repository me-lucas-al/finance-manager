import { createCreditCardAction, deleteCreditCardAction, updateCreditCardAction } from '@/app/actions/credit-cards';
import { useFixedEntryActions as useCardActions } from '@/components/fixed/useFixedEntryActions';
import { CreditCardDeleteDialog } from './CreditCardDeleteDialog';
import { CreditCardDialog } from './CreditCardDialog';
import type { CreditCardFormPayload } from './credit-card-form-values';
import type { CreditCardDialogState } from './useCreditCardDialogs';

type CreditCardsDialogsProps = {
  dialog: CreditCardDialogState | null;
  onClose: () => void;
};

export function CreditCardsDialogs({ dialog, onClose }: CreditCardsDialogsProps) {
  const { pending, error, run, clearError } = useCardActions();

  if (!dialog) return null;

  const close = () => {
    clearError();
    onClose();
  };

  if (dialog.type === 'delete') {
    return (
      <CreditCardDeleteDialog
        card={dialog.card}
        pending={pending}
        error={error}
        onClose={close}
        onConfirm={() => run(() => deleteCreditCardAction({ id: dialog.card.id }), close)}
      />
    );
  }

  const save = (payload: CreditCardFormPayload) =>
    run(
      () => (dialog.type === 'edit' ? updateCreditCardAction({ id: dialog.card.id, ...payload }) : createCreditCardAction(payload)),
      close
    );

  const dialogKey = dialog.type === 'edit' ? dialog.card.id : 'new';
  const card = dialog.type === 'edit' ? dialog.card : undefined;
  return <CreditCardDialog key={dialogKey} card={card} pending={pending} error={error} onSubmit={save} onClose={close} />;
}
