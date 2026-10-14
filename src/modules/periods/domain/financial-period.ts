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

  const spansTwoMonths = endDay < startDay;
  const startMonthOffset = currentDay >= startDay ? 0 : -1;
  const endMonthOffset = startMonthOffset + (spansTwoMonths ? 1 : 0);

  const start = dayInMonth(currentYear, currentMonth + startMonthOffset, startDay);
  const end = dayInMonth(currentYear, currentMonth + endMonthOffset, endDay);

  return { start, end: endOfDay(end) };
}
