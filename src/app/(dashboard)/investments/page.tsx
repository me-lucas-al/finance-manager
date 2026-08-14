import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserPeriodsData } from '@/modules/periods/presentation/queries/periodQueries';
import { getUserInvestmentsByPeriod, getUserInvestments } from '@/modules/investments/presentation/queries/investmentQueries';
import { getUserSettingsData } from '@/modules/users/presentation/queries/userSettingsQueries';
import { InvestmentsTable } from './components/InvestmentsTable';
import { InvestmentsFilters } from './components/InvestmentsFilters';
import { InvestmentFormDialog } from './components/InvestmentFormDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_INVESTMENT_TYPES } from './constants';

export const metadata = {
  title: 'Investimentos | Finance Manager',
};

export default async function InvestmentsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const searchParams = await props.searchParams;

  const [periods, settings] = await Promise.all([
    getUserPeriodsData(session.userId),
    getUserSettingsData(session.userId)
  ]);

  const activePeriod = periods.find(p => p.status === 'open') || periods[0];
  const selectedPeriodId = searchParams.periodId !== undefined 
    ? (searchParams.periodId === 'all' ? undefined : searchParams.periodId)
    : activePeriod?.id;

  let investments = selectedPeriodId 
    ? await getUserInvestmentsByPeriod(session.userId, selectedPeriodId)
    : await getUserInvestments(session.userId);

  const types = settings?.investmentTypes && Array.isArray(settings.investmentTypes) && settings.investmentTypes.length > 0 
    ? (settings.investmentTypes as string[]) 
    : DEFAULT_INVESTMENT_TYPES;

  // Search filter
  const search = searchParams.search?.toLowerCase() || '';
  if (search) {
    investments = investments.filter(i => 
      i.description.toLowerCase().includes(search) || 
      i.type.toLowerCase().includes(search)
    );
  }

  // Type filter
  const typeFilter = searchParams.type;
  if (typeFilter && typeFilter !== 'all') {
    investments = investments.filter(i => i.type === typeFilter);
  }

  // Sort
  const sortBy = searchParams.sort || 'date_desc';
  investments = investments.sort((a, b) => {
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
  const totalPages = Math.ceil(investments.length / itemsPerPage) || 1;
  const paginatedInvestments = investments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investimentos</h2>
          <p className="text-muted-foreground">Gerencie e acompanhe seus investimentos.</p>
        </div>
        {activePeriod && (
          <InvestmentFormDialog 
            periodId={activePeriod.id} 
            types={types} 
          />
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Seus investimentos</CardTitle>
          <CardDescription>
            Mostrando {investments.length} investimento{investments.length !== 1 ? 's' : ''} encontrado{investments.length !== 1 ? 's' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <InvestmentsFilters 
              periods={periods} 
              types={types} 
              selectedPeriodId={selectedPeriodId} 
            />
            <InvestmentsTable 
              investments={paginatedInvestments} 
              types={types}
              totalPages={totalPages}
              currentPage={page}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
