'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';

type EntryTypeTabsProps = {
  value: EntryType;
  onChange: (type: EntryType) => void;
};

const TYPE_LABELS: Array<{ type: EntryType; label: string }> = [
  { type: 'expense', label: 'Despesa' },
  { type: 'income', label: 'Receita' },
  { type: 'investment', label: 'Investimento' },
];

function isEntryType(value: unknown): value is EntryType {
  return TYPE_LABELS.some(({ type }) => type === value);
}

export function EntryTypeTabs({ value, onChange }: EntryTypeTabsProps) {
  return (
    <Tabs value={value} onValueChange={(selected) => isEntryType(selected) && onChange(selected)}>
      <TabsList className="w-full">
        {TYPE_LABELS.map(({ type, label }) => (
          <TabsTrigger key={type} value={type}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
