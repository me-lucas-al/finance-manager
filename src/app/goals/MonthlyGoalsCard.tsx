import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { goalRepository, listExpenseCategories } from '@/composition/open-finance';
import { GoalsForm } from './GoalsForm';

interface MonthlyGoalsCardProps {
  userId: string;
  month: string;
}

export async function MonthlyGoalsCard({ userId, month }: MonthlyGoalsCardProps) {
  const goals = await goalRepository.findAllByUserIdAndMonth(userId, month).catch(() => []);
  const categories = await listExpenseCategories(userId);

  const generalGoal = goals.find((goal) => goal.category === null);
  const targetByCategory = new Map(goals.map((goal) => [goal.category, goal.targetAmount]));
  const categoryTargets = Object.fromEntries(
    categories.map((category) => [category, targetByCategory.get(category) ?? null]),
  );

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white text-base">Objetivo do mês</CardTitle>
      </CardHeader>
      <CardContent>
        <GoalsForm
          month={month}
          categories={categories}
          generalTargetAmount={generalGoal?.targetAmount ?? null}
          categoryTargets={categoryTargets}
        />
      </CardContent>
    </Card>
  );
}
