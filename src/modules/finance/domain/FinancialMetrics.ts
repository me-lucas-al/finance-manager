import { Income } from './Income';
import { Expense } from './Expense';
import { Investment } from './Investment';
import { UserConfig } from './UserConfig';
import { FinancialPeriod } from './FinancialPeriod';

export enum FinancialStatus {
  ON_TRACK = 'ON_TRACK',
  WARNING = 'WARNING',
  OFF_TRACK = 'OFF_TRACK'
}

export class FinancialMetrics {
  public readonly totalIncome: number;
  public readonly totalExpense: number;
  public readonly totalInvestment: number;
  public readonly balance: number;
  public readonly expensePercentage: number;
  public readonly investmentPercentage: number;
  public readonly status: FinancialStatus;

  constructor(
    public readonly period: FinancialPeriod,
    public readonly incomes: Income[],
    public readonly expenses: Expense[],
    public readonly investments: Investment[],
    public readonly config: UserConfig = new UserConfig()
  ) {
    this.totalIncome = this.filterByPeriod(incomes, period).reduce((sum, item) => sum + item.amount, 0);
    this.totalExpense = this.filterByPeriod(expenses, period).reduce((sum, item) => sum + item.amount, 0);
    this.totalInvestment = this.filterByPeriod(investments, period).reduce((sum, item) => sum + item.amount, 0);
    
    this.balance = this.totalIncome - this.totalExpense - this.totalInvestment;

    if (this.totalIncome > 0) {
      this.expensePercentage = (this.totalExpense / this.totalIncome) * 100;
      this.investmentPercentage = (this.totalInvestment / this.totalIncome) * 100;
    } else {
      this.expensePercentage = this.totalExpense > 0 ? Infinity : 0;
      this.investmentPercentage = this.totalInvestment > 0 ? Infinity : 0;
    }

    this.status = this.calculateStatus();
  }

  private filterByPeriod<T extends { date: Date }>(items: T[], period: FinancialPeriod): T[] {
    return items.filter(item => period.contains(item.date));
  }

  private calculateStatus(): FinancialStatus {
    if (this.balance < 0) {
      return FinancialStatus.OFF_TRACK;
    }

    if (this.totalIncome === 0) {
       return FinancialStatus.ON_TRACK;
    }

    const isExpenseWarning = this.config.distributionRule.isExpenseWarning(this.expensePercentage);
    const isInvestmentWarning = this.config.distributionRule.isInvestmentWarning(this.investmentPercentage);

    if (isExpenseWarning || isInvestmentWarning) {
      return FinancialStatus.WARNING;
    }

    return FinancialStatus.ON_TRACK;
  }
}
