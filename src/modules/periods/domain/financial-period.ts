function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function dayInMonth(year: number, month: number, day: number): Date {
  const clampedDay = Math.min(day, lastDayOfMonth(year, month));
  return new Date(year, month, clampedDay);
}

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getFinancialPeriod(date: Date, startDay: number = 15, endDay: number = 14) {
  const currentDay = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  let start: Date;
  let end: Date;

  if (endDay >= startDay) {
    // Period fits within a single month (e.g., 1st -> 30th).
    if (currentDay >= startDay) {
      start = dayInMonth(currentYear, currentMonth, startDay);
      end = dayInMonth(currentYear, currentMonth, endDay);
    } else {
      start = dayInMonth(currentYear, currentMonth - 1, startDay);
      end = dayInMonth(currentYear, currentMonth - 1, endDay);
    }
  } else {
    // Period spans two months (e.g., 15th -> 14th of the next month).
    if (currentDay >= startDay) {
      start = dayInMonth(currentYear, currentMonth, startDay);
      end = dayInMonth(currentYear, currentMonth + 1, endDay);
    } else {
      start = dayInMonth(currentYear, currentMonth - 1, startDay);
      end = dayInMonth(currentYear, currentMonth, endDay);
    }
  }

  return { start, end: endOfDay(end) };
}
