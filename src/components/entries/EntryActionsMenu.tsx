'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteEntryAlert } from './DeleteEntryAlert';
import { EntryDialog } from './EntryDialog';
import type { EditableEntry } from './entry-form-values';
import { useEntryCategories } from './useEntryCategories';

export function EntryActionsMenu({ entry }: { entry: EditableEntry }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { categoriesByType, loadCategories } = useEntryCategories();

  function openEdit() {
    loadCategories();
    setIsEditOpen(true);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Ações para ${entry.description}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 outline-none transition-colors hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          }
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={openEdit}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EntryDialog open={isEditOpen} onOpenChange={setIsEditOpen} categoriesByType={categoriesByType} entry={entry} />
      <DeleteEntryAlert open={isDeleteOpen} onOpenChange={setIsDeleteOpen} entry={entry} />
    </>
  );
}
