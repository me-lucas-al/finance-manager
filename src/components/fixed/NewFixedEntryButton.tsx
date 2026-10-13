'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { FixedEntryKind } from '@/modules/finance/domain/models/fixed-entry';

export function NewFixedEntryButton({ onCreate }: { onCreate: (kind: FixedEntryKind) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" className="bg-blue-600 text-white hover:bg-blue-500" />}>
        <Plus className="h-3.5 w-3.5" /> Novo fixo
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-[#121318] border-zinc-800 text-zinc-200">
        <DropdownMenuItem onClick={() => onCreate('expense')}>Despesa</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCreate('income')}>Receita</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
