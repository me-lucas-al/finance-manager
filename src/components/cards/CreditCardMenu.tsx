import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { CreditCard } from '@/modules/finance/domain/models/credit-card';

type CreditCardMenuProps = {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
};

export function CreditCardMenu({ card, onEdit, onDelete }: CreditCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`Ações de ${card.name}`} className="text-zinc-400 hover:text-white" />}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-[#121318] border-zinc-800 text-zinc-200">
        <DropdownMenuItem onClick={() => onEdit(card)}>
          <Pencil className="h-4 w-4" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(card)} className="text-red-400">
          <Trash2 className="h-4 w-4" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
