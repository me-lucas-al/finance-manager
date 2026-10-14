import { Suspense } from 'react';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { getCurrentMonth, monthLabel, toMonthStart } from '@/lib/month';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionSkeleton } from '@/components/shared/SectionSkeleton';
import { GoalsChat } from './GoalsChat';
import { MonthlyGoalsCard } from './MonthlyGoalsCard';
import { SavingsGoalsCard } from './SavingsGoalsCard';

export default async function GoalsPage() {
  const userId = await requireUserId();
  const currentMonth = getCurrentMonth();

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Metas — {monthLabel(currentMonth)}</h1>
          <p className="text-sm text-zinc-400">
            Defina o objetivo financeiro geral e limites por categoria para este mês.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<SectionSkeleton height="h-64" />}>
            <MonthlyGoalsCard userId={userId} month={toMonthStart(currentMonth)} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton height="h-64" />}>
            <SavingsGoalsCard userId={userId} />
          </Suspense>
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
