'use client';

import { Input } from '@/components/ui/input';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import { FormField } from './FormField';

type CategoryFieldProps = {
  type: EntryType;
  value: string;
  options: string[];
  error?: string;
  onChange: (value: string) => void;
};

export function CategoryField({ type, value, options, error, onChange }: CategoryFieldProps) {
  const label = type === 'investment' ? 'Tipo do investimento' : 'Categoria';

  return (
    <FormField label={label} htmlFor="entry-category" error={error}>
      <Input
        id="entry-category"
        list="entry-category-options"
        autoComplete="off"
        placeholder="Escolha ou digite"
        value={value}
        aria-invalid={error !== undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-9"
      />
      <datalist id="entry-category-options">
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </FormField>
  );
}
