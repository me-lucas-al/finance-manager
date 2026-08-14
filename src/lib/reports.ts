export type Income = { amount: number };
export type Expense = { amount: number; category: string };
export type Investment = { amount: number };

export interface ReportMetrics {
  totalIncomes: number;
  totalExpenses: number;
  totalInvestments: number;
  balance: number;
  averageExpense: number;
  maxExpense: number;
  dominantCategory: string | null;
  expensePercentage: number;
  investmentPercentage: number;
}

export function calculateReportMetrics(
  incomes: Income[],
  expenses: Expense[],
  investments: Investment[]
): ReportMetrics {
  const totalIncomes = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalInvestments = investments.reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncomes - totalExpenses - totalInvestments;

  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  
  const maxExpense = expenses.length > 0 
    ? Math.max(...expenses.map((e) => e.amount)) 
    : 0;

  const categoryTotals: Record<string, number> = {};
  for (const expense of expenses) {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  }

  let dominantCategory: string | null = null;
  let maxCategoryAmount = -1;
  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > maxCategoryAmount) {
      maxCategoryAmount = amount;
      dominantCategory = category;
    }
  }

  const expensePercentage = totalIncomes > 0 ? (totalExpenses / totalIncomes) * 100 : 0;
  const investmentPercentage = totalIncomes > 0 ? (totalInvestments / totalIncomes) * 100 : 0;

  return {
    totalIncomes,
    totalExpenses,
    totalInvestments,
    balance,
    averageExpense,
    maxExpense,
    dominantCategory,
    expensePercentage,
    investmentPercentage,
  };
}
