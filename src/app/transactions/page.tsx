import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EntryTable, type EntryTableRow } from '@/components/entries/EntryTable';
import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { EditTransactionDialog } from './components';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Acesso negado</div>;
  }
  const userId = session.user.id;

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { month: rawMonth } = await searchParams;
  const month = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : defaultMonth;

  const transactionRepository = new SupabaseTransactionRepository();
  const [transactions, categories] = await Promise.all([
    transactionRepository.findAllByUserId(userId, { month }),
    getExpenseCategories(userId),
  ]);

  const rows: EntryTableRow[] = transactions.map((transaction) => {
    const currentCategory = transaction.category ?? transaction.categorySuggested ?? categories[0] ?? 'Outros';
    return {
      id: transaction.id,
      date: new Date(`${transaction.occurredAt}T00:00:00`),
      description: transaction.description,
      category: transaction.category ?? transaction.categorySuggested ?? 'Sem categoria',
      amount: transaction.amount,
      actions: (
        <EditTransactionDialog
          transactionId={transaction.id}
          categories={categories}
          defaultCategory={currentCategory}
          defaultReason={transaction.reason ?? ''}
        />
      ),
    };
  });

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 min-h-screen bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Transações</h2>
        <form className="flex items-center gap-2">
          <Input type="month" name="month" defaultValue={month} className="w-auto" />
          <Button type="submit" variant="outline" size="sm">
            Filtrar
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sincronizadas via Open Finance</CardTitle>
        </CardHeader>
        <CardContent>
          <EntryTable
            rows={rows}
            categoryLabel="Categoria"
            emptyMessage="Nenhuma transação neste mês. Elas chegam automaticamente assim que o Itaú, Nubank ou Inter forem conectados via Open Finance."
          />
        </CardContent>
      </Card>
    </div>
  );
}
