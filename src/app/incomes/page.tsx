import { auth } from '@/auth';
import { db } from '../../db';
import { incomes } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { IncomeForm, EditIncomeButton, DeleteIncomeButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntryTable, type EntryRow, type EntryTableRow } from '@/components/entries/EntryTable';
import { getUserSettings } from '@/app/actions/users';

export default async function IncomesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;
  const [userIncomes, settings] = await Promise.all([
    db.select().from(incomes).where(eq(incomes.userId, userId)).orderBy(incomes.receivedAt),
    getUserSettings(),
  ]);
  const categories = settings?.expenseCategories ?? [];

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
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
