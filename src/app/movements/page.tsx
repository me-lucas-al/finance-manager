import { MovementsTabs, type MovementsTab } from './MovementsTabs';
import { TransactionsTab } from './TransactionsTab';
import { IncomesTab } from './IncomesTab';
import { InvestmentsTab } from './InvestmentsTab';

type MovementsSearchParams = {
  tab?: string;
  month?: string;
  q?: string;
  category?: string;
  sort?: string;
  dir?: string;
  page?: string;
};

function resolveTab(raw?: string): MovementsTab {
  if (raw === 'incomes' || raw === 'investments') return raw;
  return 'transactions';
}

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<MovementsSearchParams>;
}) {
  const params = await searchParams;
  const tab = resolveTab(params.tab);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 min-h-screen bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Movimentações</h2>
      </div>

      <MovementsTabs tab={tab}>
        {tab === 'transactions' && <TransactionsTab searchParams={params} />}
        {tab === 'incomes' && <IncomesTab searchParams={params} />}
        {tab === 'investments' && <InvestmentsTab searchParams={params} />}
      </MovementsTabs>
    </div>
  );
}
