import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserPeriodsData } from '@/modules/periods/presentation/queries/periodQueries';
import { getUserIncomesByPeriod } from '@/modules/incomes/presentation/queries/incomeQueries';
import { IncomesTable } from './components/IncomesTable';
import { IncomesFilters } from './components/IncomesFilters';
import { IncomeFormDialog } from './components/IncomeFormDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_CATEGORIES } from './constants';

export const metadata = {
  title: 'Receitas | Finance Manager',
};

export default async function IncomesPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const searchParams = await props.searchParams;

  const periods = await getUserPeriodsData(session.userId);

  const activePeriod = periods.find(p => p.status === 'open') || periods[0];
  const selectedPeriodId = searchParams.periodId || activePeriod?.id;

  let incomes = selectedPeriodId 
    ? await getUserIncomesByPeriod(session.userId, selectedPeriodId)
    : [];

  const categories = DEFAULT_CATEGORIES;

  // Search filter
  const search = searchParams.search?.toLowerCase() || '';
  if (search) {
    incomes = incomes.filter(i => 
      i.description.toLowerCase().includes(search) || 
      i.category.toLowerCase().includes(search)
    );
  }

  // Category filter
  const categoryFilter = searchParams.category;
  if (categoryFilter && categoryFilter !== 'all') {
    incomes = incomes.filter(i => i.category === categoryFilter);
  }

  // Sort
  const sortBy = searchParams.sort || 'date_desc';
  incomes = incomes.sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
      case 'date_desc':
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      case 'amount_asc':
        return a.amount - b.amount;
      case 'amount_desc':
        return b.amount - a.amount;
      default:
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    }
  });

  // Pagination
  const page = parseInt(searchParams.page || '1', 10);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(incomes.length / itemsPerPage) || 1;
  const paginatedIncomes = incomes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
          <p className="text-muted-foreground">Gerencie e acompanhe suas receitas.</p>
        </div>
        {selectedPeriodId && (
          <IncomeFormDialog 
            periodId={selectedPeriodId} 
            categories={categories} 
          />
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Suas receitas</CardTitle>
          <CardDescription>
            Mostrando {incomes.length} receita{incomes.length !== 1 ? 's' : ''} encontradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <IncomesFilters 
              periods={periods} 
              categories={categories} 
              selectedPeriodId={selectedPeriodId} 
            />
            <IncomesTable 
              incomes={paginatedIncomes} 
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
