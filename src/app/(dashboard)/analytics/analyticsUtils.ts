import { Expense } from '@/modules/expenses/domain/repositories/IExpenseRepository';
import { Income } from '@/modules/incomes/domain/repositories/IIncomeRepository';
import { Investment } from '@/modules/investments/domain/repositories/IInvestmentRepository';
import { FinancialPeriod } from '@/modules/periods/domain/repositories/IPeriodRepository';

export function getExpensesByCategory(expenses: Expense[]) {
  const categories = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categories)
    .map(([category, amount]) => ({ category, amount: amount / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

export function getEvolutionData(periods: FinancialPeriod[], expenses: Expense[], incomes: Income[], investments: Investment[]) {
  return periods.map(period => {
    const periodExpenses = expenses.filter(e => e.periodId === period.id);
    const periodIncomes = incomes.filter(i => i.periodId === period.id);
    const periodInvestments = investments.filter(i => i.periodId === period.id);

    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0) / 100;
    const totalIncomes = periodIncomes.reduce((sum, i) => sum + i.amount, 0) / 100;
    const totalInvestments = periodInvestments.reduce((sum, i) => sum + i.amount, 0) / 100;

    return {
      period: new Date(period.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      expenses: totalExpenses,
      incomes: totalIncomes,
      investments: totalInvestments,
      balance: totalIncomes - totalExpenses - totalInvestments,
    };
  });
}

export function getInvestmentsByType(investments: Investment[]) {
  const types = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(types)
    .map(([type, amount]) => ({ type, amount: amount / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

export function getExpensesByDay(expenses: Expense[]) {
  const days = expenses.reduce((acc, expense) => {
    // extract day string 'DD/MM'
    const dateStr = new Date(expense.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    acc[dateStr] = (acc[dateStr] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(days)
    .map(([date, amount]) => ({ date, amount: amount / 100 }))
    .sort((a, b) => {
      // rough sort by extracting day and month
      const [dayA, monthA] = a.date.split('/');
      const [dayB, monthB] = b.date.split('/');
      return new Date(2000, Number(monthA) - 1, Number(dayA)).getTime() - new Date(2000, Number(monthB) - 1, Number(dayB)).getTime();
    });
}
