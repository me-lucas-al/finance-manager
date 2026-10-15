'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_OPTION, type StatementTypeFilter } from '@/modules/finance/domain/models/statement-filters';
import { ENTRY_KIND_STYLE } from './entry-kind-style';

interface ExplorerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  categoryOptions: string[];
  onCategoryChange: (value: string) => void;
  typeFilter: StatementTypeFilter;
  onTypeChange: (value: StatementTypeFilter) => void;
}

const TYPE_OPTIONS: Array<{ value: StatementTypeFilter; label: string }> = [
  { value: ALL_OPTION, label: 'Todos' },
  { value: 'income', label: ENTRY_KIND_STYLE.income.label },
  { value: 'expense', label: ENTRY_KIND_STYLE.expense.label },
  { value: 'investment', label: ENTRY_KIND_STYLE.investment.label },
];

export function ExplorerFilters(props: ExplorerFiltersProps) {
  const isUnlisted = props.category !== ALL_OPTION && !props.categoryOptions.includes(props.category);
  const categoryNames = isUnlisted ? [...props.categoryOptions, props.category] : props.categoryOptions;
  const categoryItems = [
    { value: ALL_OPTION, label: 'Todas categorias' },
    ...categoryNames.map((name) => ({ value: name, label: name })),
  ];

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
        <Select
          value={props.category}
          items={categoryItems}
          onValueChange={(value) => props.onCategoryChange(value ?? ALL_OPTION)}
        >
          <SelectTrigger className="w-44 h-9 bg-zinc-900/60 border-zinc-800 text-xs text-zinc-300 rounded-lg">
            <SelectValue placeholder="Todas categorias" />
          </SelectTrigger>
          <SelectContent className="bg-[#121318] border-zinc-800 text-xs text-zinc-200">
            {categoryItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
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
