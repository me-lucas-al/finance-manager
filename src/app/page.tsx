import { getSession } from '../modules/auth/application/session';
import { db } from '../db';
import { expenses, incomes, investments, userSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }

  const userId = session.user.id;

  // Fetch data directly for the dashboard in parallel to prevent waterfalls
  const [userExpenses, userIncomes, userInvestments, settingsResult] = await Promise.all([
    db.select().from(expenses).where(eq(expenses.userId, userId)),
    db.select().from(incomes).where(eq(incomes.userId, userId)),
    db.select().from(investments).where(eq(investments.userId, userId)),
    db.select().from(userSettings).where(eq(userSettings.userId, userId))
  ]);
  
  const settings = settingsResult[0];
  
  const maxExpensesPercentage = settings?.maxExpensesPercentage || 80;
  const minInvestmentPercentage = settings?.minInvestmentPercentage || 20;

  const totalIncome = userIncomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = userExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalInvestment = userInvestments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIncome - totalExpense - totalInvestment;

  const expensePercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const investmentPercentage = totalIncome > 0 ? (totalInvestment / totalIncome) * 100 : 0;

  const availableForExpenses = Math.max(0, (totalIncome * (maxExpensesPercentage / 100)) - totalExpense);
  const remainingForInvestment = Math.max(0, (totalIncome * (minInvestmentPercentage / 100)) - totalInvestment);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {totalExpense.toFixed(2)}</div>
            <p className="text-xs text-slate-500">
              {expensePercentage.toFixed(1)}% da receita (Máx: {maxExpensesPercentage}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {totalInvestment.toFixed(2)}</div>
            <p className="text-xs text-slate-500">
              {investmentPercentage.toFixed(1)}% da receita (Mín: {minInvestmentPercentage}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {balance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Limite de Gastos</CardTitle>
            <CardDescription>
              Disponível para gastar: R$ {availableForExpenses.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={expensePercentage} max={maxExpensesPercentage} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Meta de Investimento</CardTitle>
            <CardDescription>
              Falta investir: R$ {remainingForInvestment.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={investmentPercentage} max={minInvestmentPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
