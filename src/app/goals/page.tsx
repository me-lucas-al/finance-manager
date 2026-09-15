import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/format';
import {
  SupabaseGoalRepository,
  SupabaseSavingsGoalRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';
import { getExpenseCategories } from '@/modules/open-finance/application/shared/expense-categories';
import { GoalsChat, GoalsForm } from './components';

export default async function GoalsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? process.env.FINANCE_OWNER_USER_ID ?? '3dd11c4e-e3c6-4a97-adb4-431ca7f476f1';

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  const goalRepository = new SupabaseGoalRepository();
  const savingsGoalRepository = new SupabaseSavingsGoalRepository();
  const [goals, categories, savingsGoals] = await Promise.all([
    goalRepository.findAllByUserIdAndMonth(userId, month).catch(() => []),
    getExpenseCategories(userId),
    savingsGoalRepository.findAllActiveByUserId(userId).catch(() => []),
  ]);

  const generalGoal = goals.find((goal) => goal.category === null) ?? null;
  const goalsByCategory = new Map(
    goals.filter((goal) => goal.category !== null).map((goal) => [goal.category as string, goal]),
  );

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white capitalize">
            Metas — {monthLabel}
          </h1>
          <p className="text-sm text-zinc-400">
            Defina o objetivo financeiro geral e limites por categoria para este mês.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-base">Objetivo do mês</CardTitle>
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

          <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-base">Objetivos de economia</CardTitle>
            </CardHeader>
            <CardContent>
              {savingsGoals.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Nenhum objetivo de economia em andamento ainda. Conte pro assistente ao lado o que quer guardar.
                </p>
              ) : (
                <div className="space-y-4">
                  {savingsGoals.map((goal) => {
                    const percent = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
                    return (
                      <div key={goal.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-white">{goal.title}</span>
                          <span className="text-zinc-400">
                            {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        <Progress value={percent} />
                        {goal.targetDate && <p className="text-xs text-zinc-500">até {goal.targetDate}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl bg-[#111216] border-zinc-800/80 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Assistente de objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalsChat />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
