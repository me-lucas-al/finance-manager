import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { IncomeForm, EditIncomeButton, DeleteIncomeButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntryTable, type EntryRow, type EntryTableRow } from '@/components/entries/EntryTable';
import { PAGE_SIZE, type EntrySortField } from '@/components/entries/constants';
import { getUserSettings } from '@/app/actions/users';
import { getIncomesPage } from '@/app/actions/finance';

export default async function IncomesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; dir?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const { q, category, sort: rawSort, dir: rawDir, page: rawPage } = await searchParams;
  const search = q ?? '';
  const sort: EntrySortField = rawSort === 'description' || rawSort === 'amount' ? rawSort : 'date';
  const dir: 'asc' | 'desc' = rawDir === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);

  const [{ rows: userIncomes, total }, settings] = await Promise.all([
    getIncomesPage({ search, category, sort, dir, page }),
    getUserSettings(),
  ]);
  const categories = settings?.expenseCategories ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (page > totalPages) {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (rawSort) params.set('sort', rawSort);
    if (rawDir) params.set('dir', rawDir);
    params.set('page', String(totalPages));
    redirect(`/incomes?${params.toString()}`);
  }

  const rows: EntryRow[] = userIncomes.map((income) => ({
    id: income.id,
    date: new Date(income.receivedAt),
    description: income.description,
    category: income.category,
    amount: Number(income.amount),
  }));

  const tableRows: EntryTableRow[] = rows.map((row) => ({
    ...row,
    actions: (
      <>
        <EditIncomeButton row={row} categories={categories} />
        <DeleteIncomeButton id={row.id} />
      </>
    ),
  }));

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 min-h-screen bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Receitas</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Nova Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeForm categories={categories} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <EntryTable
              rows={tableRows}
              categoryLabel="Categoria"
              emptyMessage="Nenhuma receita registrada."
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
    </div>
  );
}
