export class Income {
  constructor(
    public readonly id: string,
    public readonly source: string,
    public readonly amount: number,
    public readonly date: Date
  ) {
    if (amount < 0) {
      throw new Error('Income amount cannot be negative');
    }
  }
}
