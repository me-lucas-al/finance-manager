import { getSession } from '../../modules/auth/application/session';
import { db } from '../../db';
import { incomes, financialPeriods } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { IncomeForm, DeleteIncomeButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = "force-dynamic";

export default async function IncomesPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;
  const userIncomes = await db.select().from(incomes).where(eq(incomes.userId, userId)).orderBy(incomes.receivedAt);
  
  // Try to get current period, or fallback
  const periods = await db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId));
  const periodId = periods.length > 0 ? periods[0].id : "default-period";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Receitas</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Nova Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeForm periodId={periodId} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Receitas</CardTitle>
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
                {userIncomes.map((income: any) => (
                  <TableRow key={income.id}>
                    <TableCell>{new Date(income.receivedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{income.description}</TableCell>
                    <TableCell>{income.category}</TableCell>
                    <TableCell>R$ {Number(income.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DeleteIncomeButton id={income.id} />
                    </TableCell>
                  </TableRow>
                ))}
                {userIncomes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Nenhuma receita registrada.</TableCell>
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
