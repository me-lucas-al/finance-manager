export class Investment {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly amount: number,
    public readonly date: Date
  ) {
    if (amount < 0) {
      throw new Error('Investment amount cannot be negative');
    }
  }
}
