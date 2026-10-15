'use client';

import { Input } from '@/components/ui/input';
import { maskCurrencyInput } from './currency-mask';
import { FormField } from './FormField';

type CurrencyFieldProps = {
  value: string;
  error?: string;
  onChange: (maskedValue: string) => void;
};

export function CurrencyField({ value, error, onChange }: CurrencyFieldProps) {
  return (
    <FormField label="Valor" htmlFor="entry-amount" error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">R$</span>
        <Input
          id="entry-amount"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0,00"
          value={value}
          aria-invalid={error !== undefined}
          onChange={(event) => onChange(maskCurrencyInput(event.target.value))}
          className="h-9 pl-9"
        />
      </div>
    </FormField>
  );
}
