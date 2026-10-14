export type Setting = {
  id: string;
  userId: string;
  periodStartDay: number;
  periodEndDay: number;
  maxExpensesPercentage: number;
  minInvestmentPercentage: number;
  initialBalance: string;
  expenseCategories: string[];
  investmentTypes: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type NewSetting = {
  id: string;
  userId: string;
  periodStartDay?: number;
  periodEndDay?: number;
  maxExpensesPercentage?: number;
  minInvestmentPercentage?: number;
  initialBalance?: string;
  expenseCategories?: string[];
  investmentTypes?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};
