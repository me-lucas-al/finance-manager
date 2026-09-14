'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { EntrySortField } from '@/components/entries/constants';

export interface EntryRow {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
}

export type EntryTableRow = EntryRow & { actions: ReactNode };

type SortField = EntrySortField;

interface EntryTableProps {
  rows: EntryTableRow[];
  categoryLabel: string;
  emptyMessage: string;
  categoryOptions: string[];
  search: string;
  category: string;
  sort: SortField;
  dir: 'asc' | 'desc';
  page: number;
  totalPages: number;
}

export function EntryTable({
  rows,
  categoryLabel,
  emptyMessage,
  categoryOptions,
  search,
  category,
  sort,
  dir,
  page,
  totalPages,
}: EntryTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [prevSearch, setPrevSearch] = useState(search);
  const [draft, setDraft] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setDraft(search);
  }
  const debouncedDraft = useDebouncedValue(draft, 400);

  useEffect(() => {
    if (debouncedDraft !== search) updateParams({ q: debouncedDraft || null, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  function updateParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleSort(field: SortField) {
    const nextDir = sort === field && dir === 'asc' ? 'desc' : sort === field ? 'asc' : 'desc';
    updateParams({ sort: field, dir: nextDir, page: null });
  }

  function sortIndicator(field: SortField) {
    if (sort !== field) return null;
    return dir === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por descrição..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Select
          value={category || 'all'}
          onValueChange={(value) => updateParams({ category: value === 'all' ? null : (value as string), page: null })}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={categoryLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as {categoryLabel.toLowerCase()}s</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('date')}>
                Data{sortIndicator('date')}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('description')}>
                Descrição{sortIndicator('description')}
              </TableHead>
              <TableHead>{categoryLabel}</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                Valor{sortIndicator('amount')}
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date.toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell className="font-mono tabular-nums">{formatCurrency(row.amount)}</TableCell>
                <TableCell className="flex justify-end gap-1 text-right">{row.actions}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">{emptyMessage}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
