import { getSession } from '../../modules/auth/application/session';
import { db } from '../../db';
import { investments, financialPeriods } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { InvestmentForm, DeleteInvestmentButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;
  const userInvestments = await db.select().from(investments).where(eq(investments.userId, userId)).orderBy(investments.date);
  
  // Try to get current period, or fallback
  const periods = await db.select().from(financialPeriods).where(eq(financialPeriods.userId, userId));
  const periodId = periods.length > 0 ? periods[0].id : "default-period";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Investimentos</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Novo Investimento</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentForm periodId={periodId} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userInvestments.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                    <TableCell>{inv.description}</TableCell>
                    <TableCell>{inv.type}</TableCell>
                    <TableCell>R$ {Number(inv.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DeleteInvestmentButton id={inv.id} />
                    </TableCell>
                  </TableRow>
                ))}
                {userInvestments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Nenhum investimento registrado.</TableCell>
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
