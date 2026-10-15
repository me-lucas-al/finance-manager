import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreditCardFormValues } from './credit-card-form-values';

type CreditCardFormFieldsProps = {
  values: CreditCardFormValues;
  onChange: <K extends keyof CreditCardFormValues>(key: K, value: CreditCardFormValues[K]) => void;
};

const FIELD_CLASS = 'bg-zinc-900/60 border-zinc-800 text-white placeholder:text-zinc-500';

export function CreditCardFormFields({ values, onChange }: CreditCardFormFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="card-name">Nome</Label>
        <Input id="card-name" className={FIELD_CLASS} value={values.name} placeholder="Nubank" onChange={(event) => onChange('name', event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="card-digits">Final (opcional)</Label>
          <Input id="card-digits" className={FIELD_CLASS} inputMode="numeric" maxLength={4} value={values.lastDigits} placeholder="1234" onChange={(event) => onChange('lastDigits', event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="card-limit">Limite</Label>
          <Input id="card-limit" className={FIELD_CLASS} inputMode="decimal" value={values.limit} placeholder="5.000,00" onChange={(event) => onChange('limit', event.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="card-closing-day">Dia de fechamento da fatura (opcional)</Label>
        <Input id="card-closing-day" className={FIELD_CLASS} type="number" min={1} max={31} value={values.closingDay} placeholder="10" onChange={(event) => onChange('closingDay', event.target.value)} />
      </div>
    </div>
  );
}
