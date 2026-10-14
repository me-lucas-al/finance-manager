import { Amount } from '@/components/shared/Amount';
import type { BalancePoint } from '@/types/overview';
import { BalanceAreaChart } from './BalanceAreaChart';

interface BalanceEvolutionChartProps {
  initialBalance: number;
  data: BalancePoint[];
}

export function BalanceEvolutionChart({ initialBalance, data }: BalanceEvolutionChartProps) {
  return (
    <div className="w-full">
      <div className="mb-4">
        <Amount value={initialBalance} className="text-3xl font-bold tracking-tight text-white" />
      </div>
      {data.length === 0 ? (
        <div className="h-[220px] w-full mt-6 flex items-center justify-center text-xs text-zinc-500">
          Sem histórico suficiente para exibir a evolução do saldo.
        </div>
      ) : (
        <BalanceAreaChart data={data} />
      )}
    </div>
  );
}
