export type CategoryMetric = {
  category: string;
  currentAmount: number;
  previousAmount: number;
  diffPercentage: number;
  goalAmount?: number;
};

export type FinancialSnapshot = {
  currentMonth: {
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    netBalance: number;
    savingsRate: number;
    categories: Record<string, number>;
  };
  previousMonth: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
  threeMonthsAverageExpenses: number;
  totalInvested: number;
  categoryMetrics: CategoryMetric[];
};
