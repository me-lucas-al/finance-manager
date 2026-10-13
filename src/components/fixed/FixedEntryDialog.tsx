'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCurrentMonth, toLocalDateString } from '@/lib/month';
import { resolveDueDate } from '@/modules/finance/domain/services/resolve-due-date';
import { FixedEntryFormFields } from './FixedEntryFormFields';
import type { FixedEntryFormPayload, FixedEntryFormValues } from './fixed-entry-form-values';
import type { FixedEntryDialogState } from './useFixedEntryDialogs';
import { useFixedEntryForm } from './useFixedEntryForm';

type EditableDialogState = Exclude<FixedEntryDialogState, { type: 'delete' }>;

export type FixedEntrySubmission = {
  payload: FixedEntryFormPayload;
  options: Pick<FixedEntryFormValues, 'launchThisMonth' | 'applyToCurrentMonth'>;
};

type FixedEntryDialogProps = {
  state: EditableDialogState;
  pending: boolean;
  error: string | null;
  onSubmit: (submission: FixedEntrySubmission) => void;
  onClose: () => void;
};

const KIND_TITLE = { expense: 'Nova despesa fixa', income: 'Nova receita fixa' };

export function FixedEntryDialog({ state, pending, error, onSubmit, onClose }: FixedEntryDialogProps) {
  const entry = state.type === 'edit' ? state.entry : undefined;
  const { values, setField, parse, formError } = useFixedEntryForm(entry);
  const dueDay = Number(values.dueDay);
  const dueDayPassed =
    Number.isInteger(dueDay) && dueDay >= 1 && resolveDueDate(getCurrentMonth(), dueDay) < toLocalDateString(new Date());

  const submit = () => {
    const payload = parse();
    if (payload) onSubmit({ payload, options: values });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111216] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>{state.type === 'create' ? KIND_TITLE[state.kind] : 'Editar lançamento fixo'}</DialogTitle>
          <DialogDescription>Lançado automaticamente todo mês no dia do vencimento.</DialogDescription>
        </DialogHeader>
        <FixedEntryFormFields
          values={values}
          onChange={setField}
          launchOption={state.type === 'create' && dueDayPassed}
          applyOption={entry?.status === 'launched'}
        />
        {(formError ?? error) && <p role="alert" className="text-sm text-red-400">{formError ?? error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
          <Button onClick={submit} disabled={pending}>{pending ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
