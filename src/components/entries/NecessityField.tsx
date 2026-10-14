'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ENTRY_NECESSITIES, isEntryNecessity } from '@/modules/finance/domain/models/entry-necessity';
import type { EntryFormValues } from './entry-form-values';
import { FormField } from './FormField';

type NecessityFieldProps = {
  value: EntryFormValues['necessity'];
  onChange: (value: EntryFormValues['necessity']) => void;
};

const EMPTY_OPTION = 'automatic';
const NECESSITY_LABELS = { essencial: 'Essencial', importante: 'Importante', superfluo: 'Supérfluo' } as const;

export function NecessityField({ value, onChange }: NecessityFieldProps) {
  const items = [
    { value: EMPTY_OPTION, label: 'Automática' },
    ...ENTRY_NECESSITIES.map((necessity) => ({ value: necessity, label: NECESSITY_LABELS[necessity] })),
  ];

  return (
    <FormField label="Necessidade (opcional)" htmlFor="entry-necessity">
      <Select
        items={items}
        value={value === '' ? EMPTY_OPTION : value}
        onValueChange={(selected) => onChange(isEntryNecessity(selected) ? selected : '')}
      >
        <SelectTrigger id="entry-necessity" className="h-9 w-full">
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
