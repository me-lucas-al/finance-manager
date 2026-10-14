'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import type { CategoriesByType } from './entry-category-options';
import type { EditableEntry } from './entry-form-values';
import { EntryDialogForm } from './EntryDialogForm';

type EntryDialogProps = {
  categoriesByType: CategoriesByType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: EditableEntry;
  initialType?: EntryType;
};

export function EntryDialog({ open, onOpenChange, categoriesByType, entry, initialType = 'expense' }: EntryDialogProps) {
  const isEditing = entry !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados do lançamento.' : 'Registre uma despesa, receita ou investimento.'}
          </DialogDescription>
        </DialogHeader>
        <EntryDialogForm categoriesByType={categoriesByType} entry={entry} initialType={initialType} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
