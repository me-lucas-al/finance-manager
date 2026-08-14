export class Expense {
  constructor(
    public readonly id: string,
    public readonly category: string,
    public readonly amount: number,
    public readonly date: Date
  ) {
    if (amount < 0) {
      throw new Error('Expense amount cannot be negative');
    }
  }
}
