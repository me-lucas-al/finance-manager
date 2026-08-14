export class DistributionRule {
  constructor(
    public readonly maxExpensePercentage: number = 80,
    public readonly minInvestmentPercentage: number = 20
  ) {
    if (maxExpensePercentage < 0 || maxExpensePercentage > 100) {
      throw new Error('Max expense percentage must be between 0 and 100');
    }
    if (minInvestmentPercentage < 0 || minInvestmentPercentage > 100) {
      throw new Error('Min investment percentage must be between 0 and 100');
    }
  }

  isExpenseWarning(expensePercentage: number): boolean {
    return expensePercentage > this.maxExpensePercentage;
  }

  isInvestmentWarning(investmentPercentage: number): boolean {
    return investmentPercentage < this.minInvestmentPercentage;
  }
}
