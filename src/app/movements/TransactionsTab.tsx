import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EntryTable, type EntryRow } from '@/components/entries/EntryTable';
import { PAGE_SIZE, type EntrySortField } from '@/components/entries/constants';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { getTransactionsPage } from '@/app/actions/transactions';

export async function TransactionsTab({
  searchParams,
}: {
  searchParams: { month?: string; q?: string; category?: string; sort?: string; dir?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Acesso negado</div>;
  }
  const userId = session.user.id;

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { month: rawMonth, q, category, sort: rawSort, dir: rawDir, page: rawPage } = searchParams;
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
    params.set('tab', 'transactions');
    params.set('month', month);
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (rawSort) params.set('sort', rawSort);
    if (rawDir) params.set('dir', rawDir);
    params.set('page', String(totalPages));
    redirect(`/movements?${params.toString()}`);
  }

  const rows: EntryRow[] = transactions.map((transaction) => {
    const displayDescription = transaction.reason
      ? `${transaction.reason} (${transaction.description})`
      : transaction.description;
    return {
      id: transaction.id,
      date: new Date(`${transaction.occurredAt}T00:00:00`),
      description: displayDescription,
      category: transaction.category ?? transaction.categorySuggested ?? 'Sem categoria',
      amount: transaction.amount,
    };
  });

  return (
    <div className="space-y-4">
      <form className="flex items-center gap-2">
        <input type="hidden" name="tab" value="transactions" />
        <Input type="month" name="month" defaultValue={month} className="w-auto" />
        <Button type="submit" variant="outline" size="sm">
          Filtrar
        </Button>
      </form>

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
