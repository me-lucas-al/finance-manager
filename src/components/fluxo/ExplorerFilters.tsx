'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ENTRY_KIND_STYLE } from './entry-kind-style';
import type { TypeFilter } from './useTransactionFilters';

interface ExplorerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedAccount: string;
  onAccountChange: (value: string) => void;
  typeFilter: TypeFilter;
  onTypeChange: (value: TypeFilter) => void;
}

const TYPE_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: ENTRY_KIND_STYLE.income.label },
  { value: 'expense', label: ENTRY_KIND_STYLE.expense.label },
  { value: 'investment', label: ENTRY_KIND_STYLE.investment.label },
];

export function ExplorerFilters(props: ExplorerFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar transação..."
            value={props.search}
            onChange={(event) => props.onSearchChange(event.target.value)}
            className="pl-9 h-9 bg-zinc-900/60 border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus-visible:ring-blue-600 rounded-lg"
          />
        </div>
        <Select value={props.selectedAccount} onValueChange={(value) => props.onAccountChange(value ?? 'all')}>
          <SelectTrigger className="w-40 h-9 bg-zinc-900/60 border-zinc-800 text-xs text-zinc-300 rounded-lg">
            <SelectValue placeholder="Todas contas" />
          </SelectTrigger>
          <SelectContent className="bg-[#121318] border-zinc-800 text-xs text-zinc-200">
            <SelectItem value="all">Todas contas</SelectItem>
            <SelectItem value="Manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center p-1 rounded-lg bg-zinc-900/80 border border-zinc-800 self-end sm:self-auto">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => props.onTypeChange(option.value)}
            className={`text-xs px-3 py-1 rounded-md font-semibold transition-colors ${
              props.typeFilter === option.value ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
