export function calculateMetrics(incomes: number[], expenses: number[], investments: number[], maxExpensesPercentage: number = 80, minInvestmentPercentage: number = 20) {
  const totalIncome = incomes.reduce((acc, curr) => acc + curr, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr, 0);
  const totalInvestments = investments.reduce((acc, curr) => acc + curr, 0);

  const balance = totalIncome - totalExpenses - totalInvestments;

  const expensePercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const investmentPercentage = totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0;

  let status: 'ON_TRACK' | 'WARNING' | 'OFF_TRACK' = 'ON_TRACK';

  if (totalIncome === 0) {
    if (totalExpenses > 0) status = 'OFF_TRACK';
  } else {
    if (expensePercentage > maxExpensesPercentage || investmentPercentage < minInvestmentPercentage) {
      status = 'OFF_TRACK';
    } else if (expensePercentage > maxExpensesPercentage - 5 && expensePercentage <= maxExpensesPercentage) {
      status = 'WARNING';
    } else if (investmentPercentage >= minInvestmentPercentage && investmentPercentage < minInvestmentPercentage + 5) {
      status = 'WARNING';
    }
  }

  return {
    totalIncome,
    totalExpenses,
    totalInvestments,
    balance,
    expensePercentage,
    investmentPercentage,
    status
  };
}
