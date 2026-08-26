import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupabaseGoalRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { GoalsForm } from './components';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Acesso negado</div>;
  }
  const userId = session.user.id;

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  const goalRepository = new SupabaseGoalRepository();
  const [goals, categories] = await Promise.all([
    goalRepository.findAllByUserIdAndMonth(userId, month),
    getExpenseCategories(userId),
  ]);

  const generalGoal = goals.find((goal) => goal.category === null) ?? null;
  const goalsByCategory = new Map(
    goals.filter((goal) => goal.category !== null).map((goal) => [goal.category as string, goal]),
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 min-h-screen bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground capitalize">Metas — {monthLabel}</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Objetivo do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsForm
            month={month}
            categories={categories}
            generalTargetAmount={generalGoal?.targetAmount ?? null}
            categoryTargets={Object.fromEntries(
              categories.map((category) => [category, goalsByCategory.get(category)?.targetAmount ?? null]),
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
