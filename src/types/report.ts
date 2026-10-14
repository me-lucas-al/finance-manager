export interface CategoryDatum {
  category: string;
  total: number;
}

export interface EvolutionDatum {
  label: string;
  income: number;
  expenses: number;
  investments: number;
}

export interface CategoryGoalDatum {
  category: string;
  actual: number;
  target: number;
}

export interface ReportMetrics {
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  balance: number;
  expensePercentage: number;
  investmentPercentage: number;
}
