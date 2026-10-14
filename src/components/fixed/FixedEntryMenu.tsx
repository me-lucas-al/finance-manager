import { MoreHorizontal, Pause, Pencil, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { FixedEntryView } from '@/modules/finance/domain/models/fixed-entry';

export type FixedEntryMenuHandlers = {
  onEdit: (entry: FixedEntryView) => void;
  onToggleActive: (entry: FixedEntryView) => void;
  onDelete: (entry: FixedEntryView) => void;
};

type FixedEntryMenuProps = FixedEntryMenuHandlers & { entry: FixedEntryView };

export function FixedEntryMenu({ entry, onEdit, onToggleActive, onDelete }: FixedEntryMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${entry.description}`} className="text-zinc-400 hover:text-white" />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-[#121318] border-zinc-800 text-zinc-200">
        <DropdownMenuItem onClick={() => onEdit(entry)}>
          <Pencil className="h-4 w-4" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleActive(entry)}>
          {entry.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {entry.active ? 'Pausar' : 'Reativar'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(entry)} className="text-red-400">
          <Trash2 className="h-4 w-4" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
