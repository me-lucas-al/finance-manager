'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import type { CardOption } from '@/modules/finance/domain/models/credit-card';
import type { CategoriesByType } from './entry-category-options';
import type { EditableEntry } from './entry-form-values';
import { EntryDialogForm } from './EntryDialogForm';

type EntryDialogProps = {
  categoriesByType: CategoriesByType;
  cardOptions: CardOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: EditableEntry;
  initialType?: EntryType;
};

export function EntryDialog({ open, onOpenChange, categoriesByType, cardOptions, entry, initialType = 'expense' }: EntryDialogProps) {
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
        <EntryDialogForm categoriesByType={categoriesByType} cardOptions={cardOptions} entry={entry} initialType={initialType} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
