import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserPeriodsData } from '@/modules/periods/presentation/queries/periodQueries';
import { getUserExpensesByPeriod } from '@/modules/expenses/presentation/queries/expenseQueries';
import { getUserSettingsData } from '@/modules/users/presentation/queries/userSettingsQueries';
import { ExpensesTable } from './components/ExpensesTable';
import { ExpensesFilters } from './components/ExpensesFilters';
import { ExpenseFormDialog } from './components/ExpenseFormDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_CATEGORIES } from './constants';

export const metadata = {
  title: 'Despesas | Finance Manager',
};

export default async function ExpensesPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const searchParams = await props.searchParams;

  const [periods, settings] = await Promise.all([
    getUserPeriodsData(session.userId),
    getUserSettingsData(session.userId)
  ]);

  const activePeriod = periods.find(p => p.status === 'open') || periods[0];
  const selectedPeriodId = searchParams.periodId || activePeriod?.id;

  let expenses = selectedPeriodId 
    ? await getUserExpensesByPeriod(session.userId, selectedPeriodId)
    : [];

  const categories = settings?.expenseCategories && (settings.expenseCategories as string[]).length > 0 
    ? (settings.expenseCategories as string[]) 
    : DEFAULT_CATEGORIES;

  // Search filter
  const search = searchParams.search?.toLowerCase() || '';
  if (search) {
    expenses = expenses.filter(e => 
      e.description.toLowerCase().includes(search) || 
      e.category.toLowerCase().includes(search)
    );
  }

  // Category filter
  const categoryFilter = searchParams.category;
  if (categoryFilter && categoryFilter !== 'all') {
    expenses = expenses.filter(e => e.category === categoryFilter);
  }

  // Sort
  const sortBy = searchParams.sort || 'date_desc';
  expenses = expenses.sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'amount_asc':
        return a.amount - b.amount;
      case 'amount_desc':
        return b.amount - a.amount;
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Pagination
  const page = parseInt(searchParams.page || '1', 10);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(expenses.length / itemsPerPage) || 1;
  const paginatedExpenses = expenses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Despesas</h2>
          <p className="text-muted-foreground">Gerencie e acompanhe suas despesas.</p>
        </div>
        {selectedPeriodId && (
          <ExpenseFormDialog 
            periodId={selectedPeriodId} 
            categories={categories} 
          />
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Suas despesas</CardTitle>
          <CardDescription>
            Mostrando {expenses.length} despesa{expenses.length !== 1 ? 's' : ''} encontradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <ExpensesFilters 
              periods={periods} 
              categories={categories} 
              selectedPeriodId={selectedPeriodId} 
            />
            <ExpensesTable 
              expenses={paginatedExpenses} 
              categories={categories}
              totalPages={totalPages}
              currentPage={page}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
