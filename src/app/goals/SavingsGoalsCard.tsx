import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { savingsGoalRepository } from '@/composition/open-finance';
import { SavingsGoalItem } from './SavingsGoalItem';

export async function SavingsGoalsCard({ userId }: { userId: string }) {
  const savingsGoals = await savingsGoalRepository.findAllActiveByUserId(userId).catch(() => []);

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white text-base">Objetivos de economia</CardTitle>
      </CardHeader>
      <CardContent>
        {savingsGoals.length === 0 && (
          <p className="text-sm text-zinc-400">
            Nenhum objetivo de economia em andamento ainda. Conte pro assistente ao lado o que quer guardar.
          </p>
        )}
        <div className="space-y-4">
          {savingsGoals.map((goal) => (
            <SavingsGoalItem
              key={goal.id}
              title={goal.title}
              currentAmount={goal.currentAmount}
              targetAmount={goal.targetAmount}
              targetDate={goal.targetDate ?? null}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
