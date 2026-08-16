import { auth } from '@/auth';
import { db } from '../../db';
import { expenses } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { ExpenseForm, EditExpenseButton, DeleteExpenseButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntryTable, type EntryRow } from '@/components/entries/EntryTable';
import { getUserSettings } from '@/app/actions/users';

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;
  const [userExpenses, settings] = await Promise.all([
    db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(expenses.date),
    getUserSettings(),
  ]);
  const categories = settings?.expenseCategories ?? [];

  const rows: EntryRow[] = userExpenses.map((expense) => ({
    id: expense.id,
    date: new Date(expense.date),
    description: expense.description,
    category: expense.category,
    amount: Number(expense.amount),
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Despesas</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Nova Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm categories={categories} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <EntryTable
              rows={rows}
              categoryLabel="Categoria"
              emptyMessage="Nenhuma despesa registrada."
              renderActions={(row) => (
                <>
                  <EditExpenseButton row={row} categories={categories} />
                  <DeleteExpenseButton id={row.id} />
                </>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
