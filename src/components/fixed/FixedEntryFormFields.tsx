'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FixedEntryFormValues } from './fixed-entry-form-values';

type FixedEntryFormFieldsProps = {
  values: FixedEntryFormValues;
  onChange: <K extends keyof FixedEntryFormValues>(key: K, value: FixedEntryFormValues[K]) => void;
  launchOption: boolean;
  applyOption: boolean;
};

const FIELD_CLASS = 'bg-zinc-900/60 border-zinc-800 text-white placeholder:text-zinc-500';

export function FixedEntryFormFields({ values, onChange, launchOption, applyOption }: FixedEntryFormFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="fixed-description">Descrição</Label>
        <Input id="fixed-description" className={FIELD_CLASS} value={values.description} placeholder="Internet" onChange={(event) => onChange('description', event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fixed-amount">Valor</Label>
          <Input id="fixed-amount" className={FIELD_CLASS} inputMode="decimal" value={values.amount} placeholder="120,00" onChange={(event) => onChange('amount', event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fixed-due-day">Dia do vencimento</Label>
          <Input id="fixed-due-day" className={FIELD_CLASS} type="number" min={1} max={31} value={values.dueDay} placeholder="5" onChange={(event) => onChange('dueDay', event.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fixed-category">Categoria</Label>
        <Input id="fixed-category" className={FIELD_CLASS} value={values.category} placeholder="Moradia" onChange={(event) => onChange('category', event.target.value)} />
      </div>
      {launchOption && (
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={values.launchThisMonth} onChange={(event) => onChange('launchThisMonth', event.target.checked)} />
          Lançar neste mês também (o vencimento já passou)
        </label>
      )}
      {applyOption && (
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={values.applyToCurrentMonth} onChange={(event) => onChange('applyToCurrentMonth', event.target.checked)} />
          Aplicar também ao lançamento deste mês
        </label>
      )}
    </div>
  );
}
