import { auth } from '@/auth';
import { db } from '../../db';
import { investments } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { InvestmentForm, EditInvestmentButton, DeleteInvestmentButton } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntryTable, type EntryRow } from '@/components/entries/EntryTable';
import { getUserSettings } from '@/app/actions/users';

export default async function InvestmentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;
  const [userInvestments, settings] = await Promise.all([
    db.select().from(investments).where(eq(investments.userId, userId)).orderBy(investments.date),
    getUserSettings(),
  ]);
  const types = settings?.investmentTypes ?? [];

  const rows: EntryRow[] = userInvestments.map((investment) => ({
    id: investment.id,
    date: new Date(investment.date),
    description: investment.description,
    category: investment.type,
    amount: Number(investment.amount),
  }));

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
            <InvestmentForm types={types} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <EntryTable
              rows={rows}
              categoryLabel="Tipo"
              emptyMessage="Nenhum investimento registrado."
              renderActions={(row) => (
                <>
                  <EditInvestmentButton row={row} types={types} />
                  <DeleteInvestmentButton id={row.id} />
                </>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
