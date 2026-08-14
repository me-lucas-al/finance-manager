import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserPeriodsData } from '@/modules/periods/presentation/queries/periodQueries';
import { getUserSettingsData } from '@/modules/users/presentation/queries/userSettingsQueries';
import { CalendarView } from './components/CalendarView';

export default async function CalendarPage() {
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
    return <div className="p-8">Configurações de usuário não encontradas.</div>;
  }

  const activePeriod = periods.find(p => p.status === 'open');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black">Calendário Financeiro</h2>
      </div>
      <CalendarView periods={periods} activePeriod={activePeriod} settings={settings} />
    </div>
  );
}
