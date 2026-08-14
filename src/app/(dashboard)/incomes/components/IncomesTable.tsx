'use client';

import { formatCurrency } from '@/shared/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useSearchParams } from 'next/navigation';
import { IncomeFormDialog } from './IncomeFormDialog';
import { DeleteIncomeDialog } from './DeleteIncomeDialog';
import { useState } from 'react';

type Income = {
  id: string;
  description: string;
  amount: number;
  category: string;
  receivedAt: Date;
  periodId: string;
};

interface IncomesTableProps {
  incomes: Income[];
  categories: string[];
  totalPages: number;
  currentPage: number;
}

export function IncomesTable({ incomes, categories, totalPages, currentPage }: IncomesTableProps) {
  const searchParams = useSearchParams();

  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhuma receita encontrada.
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{new Date(income.receivedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{income.description}</TableCell>
                  <TableCell>{income.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(income.amount / 100)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingIncome(income)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingIncome(income)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'} 
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              // Show only 5 pages max
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href={createPageUrl(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                page === currentPage - 2 || 
                page === currentPage + 2
              ) {
                return <PaginationItem key={page}><span className="px-4 py-2">...</span></PaginationItem>;
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext 
                href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'} 
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {editingIncome && (
        <IncomeFormDialog 
          income={editingIncome} 
          periodId={editingIncome.periodId}
          categories={categories}
          open={true}
          onOpenChange={(isOpen) => !isOpen && setEditingIncome(null)}
        />
      )}

      {deletingIncome && (
        <DeleteIncomeDialog
          income={deletingIncome}
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeletingIncome(null)}
        />
      )}
    </div>
  );
}
