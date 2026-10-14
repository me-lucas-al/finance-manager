import type { CategoryDatum, CategoryGoalDatum, EvolutionDatum } from '@/types/report';
import { CategoryVsGoalChart } from './charts/CategoryVsGoalChart';
import { EvolutionChart } from './charts/EvolutionChart';
import { ExpensesByCategoryChart } from './charts/ExpensesByCategoryChart';
import { InvestmentsVsTargetChart } from './charts/InvestmentsVsTargetChart';
import { ReportChartCard } from './ReportChartCard';

export interface ReportChartsProps {
  categoryData: CategoryDatum[];
  evolutionData: EvolutionDatum[];
  currentInvestmentPercentage: number;
  minInvestmentPercentage: number;
  categoryVsGoalData: CategoryGoalDatum[];
}

export function ReportCharts(props: ReportChartsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <ReportChartCard title="Despesas por Categoria">
        <ExpensesByCategoryChart data={props.categoryData} />
      </ReportChartCard>
      <ReportChartCard title="Evolução (Receitas vs Despesas vs Investimentos)" className="lg:col-span-2">
        <EvolutionChart data={props.evolutionData} />
      </ReportChartCard>
      <ReportChartCard title="Poupança vs Meta">
        <InvestmentsVsTargetChart
          current={props.currentInvestmentPercentage}
          target={props.minInvestmentPercentage}
        />
      </ReportChartCard>
      <ReportChartCard title="Gasto vs Meta por Categoria" className="lg:col-span-4">
        <CategoryVsGoalChart data={props.categoryVsGoalData} />
      </ReportChartCard>
    </div>
  );
}
