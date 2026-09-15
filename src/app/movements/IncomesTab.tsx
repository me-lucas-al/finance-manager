import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntryTable, type EntryRow } from '@/components/entries/EntryTable';
import { PAGE_SIZE, type EntrySortField } from '@/components/entries/constants';
import { getUserSettings } from '@/app/actions/users';
import { getIncomesPage } from '@/app/actions/finance';

export async function IncomesTab({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string; dir?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const { q, category, sort: rawSort, dir: rawDir, page: rawPage } = searchParams;
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
    params.set('tab', 'incomes');
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (rawSort) params.set('sort', rawSort);
    if (rawDir) params.set('dir', rawDir);
    params.set('page', String(totalPages));
    redirect(`/movements?${params.toString()}`);
  }

  const rows: EntryRow[] = userIncomes.map((income) => ({
    id: income.id,
    date: new Date(income.receivedAt),
    description: income.description,
    category: income.category,
    amount: Number(income.amount),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Receitas</CardTitle>
      </CardHeader>
      <CardContent>
        <EntryTable
          rows={rows}
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
  );
}
