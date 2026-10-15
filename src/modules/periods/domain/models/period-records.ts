export type PeriodRecord = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: string;
};

export type PeriodSnapshotRecord = {
  periodId: string;
  totalIncomes: number;
  totalExpenses: number;
  totalInvestments: number;
  balance: number;
  expensePercentage: number;
  investmentPercentage: number;
  status: string;
};

export type PeriodEntryRef = {
  periodId: string;
  kind: 'income' | 'investment';
  id: string;
};
