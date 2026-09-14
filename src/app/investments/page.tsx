import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { InvestmentForm, EditInvestmentButton, DeleteInvestmentButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntryTable, type EntryRow, type EntryTableRow } from '@/components/entries/EntryTable';
import { PAGE_SIZE, type EntrySortField } from '@/components/entries/constants';
import { getUserSettings } from '@/app/actions/users';
import { getInvestmentsPage } from '@/app/actions/finance';

export default async function InvestmentsPage({
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

  const [{ rows: userInvestments, total }, settings] = await Promise.all([
    getInvestmentsPage({ search, category, sort, dir, page }),
    getUserSettings(),
  ]);
  const types = settings?.investmentTypes ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (page > totalPages) {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (rawSort) params.set('sort', rawSort);
    if (rawDir) params.set('dir', rawDir);
    params.set('page', String(totalPages));
    redirect(`/investments?${params.toString()}`);
  }

  const rows: EntryRow[] = userInvestments.map((investment) => ({
    id: investment.id,
    date: new Date(investment.date),
    description: investment.description,
    category: investment.type,
    amount: Number(investment.amount),
  }));

  const tableRows: EntryTableRow[] = rows.map((row) => ({
    ...row,
    actions: (
      <>
        <EditInvestmentButton row={row} types={types} />
        <DeleteInvestmentButton id={row.id} />
      </>
    ),
  }));

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 min-h-screen bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Investimentos</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Novo Investimento</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentForm types={types} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <EntryTable
              rows={tableRows}
              categoryLabel="Tipo"
              emptyMessage="Nenhum investimento registrado."
              categoryOptions={types}
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
