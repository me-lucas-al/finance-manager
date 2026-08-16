'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface EntryRow {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
}

type SortField = 'date' | 'description' | 'amount';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PAGE_SIZE = 10;

interface EntryTableProps {
  rows: EntryRow[];
  categoryLabel: string;
  emptyMessage: string;
  renderActions: (row: EntryRow) => ReactNode;
}

export function EntryTable({ rows, categoryLabel, emptyMessage, renderActions }: EntryTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).sort((a, b) => a.localeCompare(b)),
    [rows]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = term === '' || row.description.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || row.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [rows, search, categoryFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') comparison = a.date.getTime() - b.date.getTime();
      else if (sortField === 'description') comparison = a.description.localeCompare(b.description);
      else comparison = a.amount - b.amount;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return copy;
  }, [filtered, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por descrição..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value as string);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={categoryLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as {categoryLabel.toLowerCase()}s</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
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
            {paginated.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date.toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell className="tabular-nums">{currencyFormatter.format(row.amount)}</TableCell>
                <TableCell className="flex justify-end gap-1 text-right">{renderActions(row)}</TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">{emptyMessage}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {currentPage} de {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
