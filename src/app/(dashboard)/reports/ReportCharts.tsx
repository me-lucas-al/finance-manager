import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ExpensesByCategoryChart,
  EvolutionChart,
  InvestmentsVsTargetChart,
  CategoryVsGoalChart,
  type CategoryDatum,
  type EvolutionDatum,
  type CategoryGoalDatum,
} from './charts';

export function ReportCharts({
  categoryData,
  evolutionData,
  currentInvestmentPercentage,
  minInvestmentPercentage,
  categoryVsGoalData,
}: {
  categoryData: CategoryDatum[];
  evolutionData: EvolutionDatum[];
  currentInvestmentPercentage: number;
  minInvestmentPercentage: number;
  categoryVsGoalData: CategoryGoalDatum[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensesByCategoryChart data={categoryData} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Evolução (Receitas vs Despesas vs Investimentos)</CardTitle>
        </CardHeader>
        <CardContent>
          <EvolutionChart data={evolutionData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Investimentos vs Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestmentsVsTargetChart current={currentInvestmentPercentage} target={minInvestmentPercentage} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Gasto vs Meta por Categoria (mês atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryVsGoalChart data={categoryVsGoalData} />
        </CardContent>
      </Card>
    </div>
  );
}
