'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CardOption } from '@/modules/finance/domain/models/credit-card';
import { FormField } from './FormField';

type CreditCardFieldProps = {
  value: string;
  options: CardOption[];
  onChange: (value: string) => void;
};

const NO_CARD = 'none';

function labelOf({ name, lastDigits }: CardOption): string {
  return lastDigits ? `${name} •••• ${lastDigits}` : name;
}

export function CreditCardField({ value, options, onChange }: CreditCardFieldProps) {
  const items = [{ value: NO_CARD, label: 'Sem cartão' }, ...options.map((option) => ({ value: option.id, label: labelOf(option) }))];

  return (
    <FormField label="Cartão (opcional)" htmlFor="entry-credit-card">
      <Select items={items} value={value === '' ? NO_CARD : value} onValueChange={(selected) => onChange(selected === NO_CARD ? '' : selected ?? '')}>
        <SelectTrigger id="entry-credit-card" className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
