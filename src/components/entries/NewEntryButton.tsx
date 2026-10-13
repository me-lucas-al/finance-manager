'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import { useNewEntryDialog } from './NewEntryDialogProvider';

type NewEntryButtonProps = {
  type?: EntryType;
  label?: string;
  className?: string;
};

export function NewEntryButton({ type = 'expense', label = 'Novo lançamento', className }: NewEntryButtonProps) {
  const { openNewEntry } = useNewEntryDialog();

  return (
    <Button type="button" size="sm" onClick={() => openNewEntry(type)} className={className}>
      <Plus aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
