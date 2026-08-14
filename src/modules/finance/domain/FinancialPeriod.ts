export class FinancialPeriod {
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(
    public readonly startDay: number,
    public readonly endDay: number,
    public readonly year: number,
    public readonly month: number // 1-12
  ) {
    // Start date is in the specified month
    this.startDate = new Date(Date.UTC(year, month - 1, startDay, 0, 0, 0, 0));
    
    // End date is in the next month
    let endYear = year;
    let endMonth = month; // Next month (since month is 1-12, month is the index for next month in 0-11, wait, Date.UTC uses 0-11)
    if (month === 12) {
      endYear = year + 1;
      endMonth = 0; // January
    }
    
    this.endDate = new Date(Date.UTC(endYear, endMonth, endDay, 23, 59, 59, 999));
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}
