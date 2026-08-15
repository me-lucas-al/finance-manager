import { getSession } from '../../modules/auth/application/session';
import { db } from '../../db';
import { expenses } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { ExpenseForm, DeleteExpenseButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function ExpensesPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;
  const userExpenses = await db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(expenses.date);

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
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>R$ {Number(expense.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DeleteExpenseButton id={expense.id} />
                    </TableCell>
                  </TableRow>
                ))}
                {userExpenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Nenhuma despesa registrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
