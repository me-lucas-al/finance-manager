'use client';

import React from 'react';
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
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {/* Despesas por Categoria */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ExpensesByCategoryChart data={categoryData} />
        </CardContent>
      </Card>

      {/* Evolução Histórica */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm lg:col-span-2">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Evolução (Receitas vs Despesas vs Investimentos)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <EvolutionChart data={evolutionData} />
        </CardContent>
      </Card>

      {/* Investimentos vs Meta */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Poupança vs Meta
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <InvestmentsVsTargetChart current={currentInvestmentPercentage} target={minInvestmentPercentage} />
        </CardContent>
      </Card>

      {/* Gasto vs Meta por Categoria */}
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm lg:col-span-4">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Gasto vs Meta por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <CategoryVsGoalChart data={categoryVsGoalData} />
        </CardContent>
      </Card>
    </div>
  );
}
