'use client';

import { formatCurrency } from '@/shared/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useSearchParams } from 'next/navigation';
import { InvestmentFormDialog } from './InvestmentFormDialog';
import { DeleteInvestmentDialog } from './DeleteInvestmentDialog';
import { useState } from 'react';

type Investment = {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: Date;
  periodId: string;
};

interface InvestmentsTableProps {
  investments: Investment[];
  types: string[];
  totalPages: number;
  currentPage: number;
}

export function InvestmentsTable({ investments, types, totalPages, currentPage }: InvestmentsTableProps) {
  const searchParams = useSearchParams();

  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null);

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
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhum investimento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              investments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell>{new Date(investment.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{investment.description}</TableCell>
                  <TableCell>{investment.type}</TableCell>
                  <TableCell className="text-right">{formatCurrency(investment.amount / 100)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingInvestment(investment)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingInvestment(investment)}
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

      {editingInvestment && (
        <InvestmentFormDialog 
          investment={editingInvestment} 
          periodId={editingInvestment.periodId}
          types={types}
          open={true}
          onOpenChange={(isOpen) => !isOpen && setEditingInvestment(null)}
        />
      )}

      {deletingInvestment && (
        <DeleteInvestmentDialog
          investment={deletingInvestment}
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeletingInvestment(null)}
        />
      )}
    </div>
  );
}
