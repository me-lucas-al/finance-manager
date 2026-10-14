'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';
import { EntryDialog } from './EntryDialog';
import { useEntryCategories } from './useEntryCategories';

type NewEntryDialogContextValue = {
  openNewEntry: (type?: EntryType) => void;
};

const NewEntryDialogContext = createContext<NewEntryDialogContextValue | null>(null);

export function NewEntryDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialType, setInitialType] = useState<EntryType>('expense');
  const { categoriesByType, loadCategories } = useEntryCategories();

  function openNewEntry(type: EntryType = 'expense') {
    setInitialType(type);
    loadCategories();
    setIsOpen(true);
  }

  return (
    <NewEntryDialogContext value={{ openNewEntry }}>
      {children}
      <EntryDialog open={isOpen} onOpenChange={setIsOpen} categoriesByType={categoriesByType} initialType={initialType} />
    </NewEntryDialogContext>
  );
}

export function useNewEntryDialog(): NewEntryDialogContextValue {
  const context = useContext(NewEntryDialogContext);
  if (!context) throw new Error('useNewEntryDialog must be used inside NewEntryDialogProvider');
  return context;
}
