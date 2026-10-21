import { daysLeftInPeriod, wallDateString, type PeriodWindow } from '@/modules/periods/domain/period-window';
import type { PromptPeriod } from './advisor-persona-prompt';

const toBrazilianDate = (date: Date): string => wallDateString(date).split('-').reverse().join('/');

export function toPromptPeriod(window: PeriodWindow, today: Date): PromptPeriod {
  return {
    referenceMonth: window.referenceMonth,
    startDate: toBrazilianDate(window.startDate),
    endDate: toBrazilianDate(window.endDate),
    daysLeft: daysLeftInPeriod(window, today),
  };
}
