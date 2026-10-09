import type { CategoryDatum, EvolutionDatum, CategoryGoalDatum } from './charts';

export type ReportFilterParams = {
  period?: string;
  bank?: string;
};

export type ReportMetrics = {
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  balance: number;
  expensePercentage: number;
  investmentPercentage: number;
};

export type ReportData = {
  noDataMessage: string | null;
  metrics: ReportMetrics;
  categoryData: CategoryDatum[];
  evolutionData: EvolutionDatum[];
  currentInvestmentPercentage: number;
  minInvestmentPercentage: number;
  categoryVsGoalData: CategoryGoalDatum[];
  selectedPeriod: string;
  selectedBank: string;
};
