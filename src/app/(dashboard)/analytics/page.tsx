import { getAnalyticsData } from './actions';
import { AnalyticsView } from './components/AnalyticsView';

export const metadata = {
  title: 'Analytics | Finance Manager',
};

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-black">Analytics</h2>
          <p className="text-gray-500 mt-1">Análise detalhada de suas finanças</p>
        </div>
      </div>
      
      <AnalyticsView data={data} />
    </div>
  );
}
