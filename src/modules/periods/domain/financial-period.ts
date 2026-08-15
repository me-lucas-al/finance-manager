export function getFinancialPeriod(date: Date, startDay: number = 15, endDay: number = 14) {
  const currentDay = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  let start: Date;
  let end: Date;

  if (currentDay >= startDay) {
    // Current date is in the first part of the period (e.g., Oct 15 -> Nov 14, date is Oct 20)
    start = new Date(currentYear, currentMonth, startDay);
    end = new Date(currentYear, currentMonth + 1, endDay);
  } else {
    // Current date is in the second part of the period (e.g., Oct 15 -> Nov 14, date is Nov 5)
    start = new Date(currentYear, currentMonth - 1, startDay);
    end = new Date(currentYear, currentMonth, endDay);
  }

  return { start, end };
}
