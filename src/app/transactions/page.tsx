import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EntryTable, type EntryTableRow } from '@/components/entries/EntryTable';
import { PAGE_SIZE, type EntrySortField } from '@/components/entries/constants';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { getTransactionsPage } from '@/app/actions/transactions';
import { EditTransactionDialog } from './components';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; q?: string; category?: string; sort?: string; dir?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Acesso negado</div>;
  }
  const userId = session.user.id;

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { month: rawMonth, q, category, sort: rawSort, dir: rawDir, page: rawPage } = await searchParams;
  const month = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : defaultMonth;
  const search = q ?? '';
  const sort: EntrySortField = rawSort === 'description' || rawSort === 'amount' ? rawSort : 'date';
  const dir: 'asc' | 'desc' = rawDir === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);

  const [{ rows: transactions, total }, categories] = await Promise.all([
    getTransactionsPage({ month, search, category, sort, dir, page }),
    getExpenseCategories(userId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (page > totalPages) {
    const params = new URLSearchParams();
    params.set('month', month);
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (rawSort) params.set('sort', rawSort);
    if (rawDir) params.set('dir', rawDir);
    params.set('page', String(totalPages));
    redirect(`/transactions?${params.toString()}`);
  }

  const rows: EntryTableRow[] = transactions.map((transaction) => {
    const currentCategory = transaction.category ?? transaction.categorySuggested ?? categories[0] ?? 'Outros';
    const displayDescription = transaction.reason
      ? `${transaction.reason} (${transaction.description})`
      : transaction.description;
    return {
      id: transaction.id,
      date: new Date(`${transaction.occurredAt}T00:00:00`),
      description: displayDescription,
      category: transaction.category ?? transaction.categorySuggested ?? 'Sem categoria',
      amount: transaction.amount,
      actions: (
        <EditTransactionDialog
          transactionId={transaction.id}
          categories={categories}
          defaultCategory={currentCategory}
          defaultReason={transaction.reason ?? ''}
        />
      ),
    };
  });

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 min-h-screen bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Transações</h2>
        <form className="flex items-center gap-2">
          <Input type="month" name="month" defaultValue={month} className="w-auto" />
          <Button type="submit" variant="outline" size="sm">
            Filtrar
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sincronizadas via Open Finance</CardTitle>
        </CardHeader>
        <CardContent>
          <EntryTable
            rows={rows}
            categoryLabel="Categoria"
            emptyMessage="Nenhuma transação neste mês. Elas chegam automaticamente assim que o Itaú, Nubank ou Inter forem conectados via Open Finance."
            categoryOptions={categories}
            search={search}
            category={category ?? ''}
            sort={sort}
            dir={dir}
            page={page}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
