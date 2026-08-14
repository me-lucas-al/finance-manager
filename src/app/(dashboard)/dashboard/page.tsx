import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserPeriodsData } from '@/modules/periods/presentation/queries/periodQueries';
import { getUserSettingsData } from '@/modules/users/presentation/queries/userSettingsQueries';
import { getUserExpensesByPeriod } from '@/modules/expenses/presentation/queries/expenseQueries';
import { getUserIncomesByPeriod } from '@/modules/incomes/presentation/queries/incomeQueries';
import { getUserInvestmentsByPeriod } from '@/modules/investments/presentation/queries/investmentQueries';
import { DashboardView } from './components/DashboardView';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session?.userId) {
    redirect('/login');
  }

  const userId = session.userId;
  
  const [periods, settings] = await Promise.all([
    getUserPeriodsData(userId),
    getUserSettingsData(userId),
  ]);

  if (!settings) {
    // Should probably create settings if they don't exist, but for now redirect or show error
    return <div className="p-8">Configurações de usuário não encontradas.</div>;
  }

  const activePeriod = periods.find(p => p.status === 'open') || periods[0];

  if (!activePeriod) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h2 className="text-2xl font-bold mb-4 text-black">Nenhum período financeiro ativo</h2>
        <p className="text-gray-600">Você precisa abrir um novo período para visualizar o painel.</p>
      </div>
    );
  }

  const [expenses, incomes, investments] = await Promise.all([
    getUserExpensesByPeriod(userId, activePeriod.id),
    getUserIncomesByPeriod(userId, activePeriod.id),
    getUserInvestmentsByPeriod(userId, activePeriod.id),
  ]);

  const totalIncomes = incomes.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0) / 100;
  const totalExpenses = expenses.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0) / 100;
  const totalInvestments = investments.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0) / 100;
  
  const balance = totalIncomes - totalExpenses - totalInvestments;

  const expensePercentage = totalIncomes > 0 ? (totalExpenses / totalIncomes) * 100 : 0;
  const investmentPercentage = totalIncomes > 0 ? (totalInvestments / totalIncomes) * 100 : 0;

  const maxExpenseLimit = totalIncomes * (settings.maxExpensesPercentage / 100);
  const minInvestmentTarget = totalIncomes * (settings.minInvestmentPercentage / 100);

  const availableExpenseLimit = Math.max(0, maxExpenseLimit - totalExpenses);
  const remainingInvestmentAmount = Math.max(0, minInvestmentTarget - totalInvestments);

  let statusText = 'Saudável';
  let statusVariant: 'default' | 'destructive' | 'warning' | 'success' = 'success';
  let statusMessage = 'Metas sendo cumpridas';

  if (expensePercentage > settings.maxExpensesPercentage) {
    statusText = 'Alerta';
    statusVariant = 'destructive';
    statusMessage = 'Gastos acima do limite estipulado';
  } else if (investmentPercentage < settings.minInvestmentPercentage) {
    statusText = 'Atenção';
    statusVariant = 'warning';
    statusMessage = 'Investimento abaixo da meta estipulada';
  }

  const now = new Date();
  const endDate = new Date(activePeriod.endDate);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const dashboardData = {
    totalIncomes,
    totalExpenses,
    totalInvestments,
    balance,
    expensePercentage,
    investmentPercentage,
    availableExpenseLimit,
    remainingInvestmentAmount,
    statusText,
    statusVariant,
    statusMessage,
    daysRemaining,
    periodStart: activePeriod.startDate,
    periodEnd: activePeriod.endDate,
    settings: {
      maxExpensesPercentage: settings.maxExpensesPercentage,
      minInvestmentPercentage: settings.minInvestmentPercentage,
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Calendar or Period Selector could go here */}
        </div>
      </div>
      <DashboardView data={dashboardData} />
    </div>
  );
}
