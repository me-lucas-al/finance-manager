import { daysLeftInPeriod, type PeriodWindow } from '@/modules/periods/domain/period-window';
import type { PromptPeriod } from './advisor-persona-prompt';

const BRAZIL_DATE: Intl.DateTimeFormatOptions = { timeZone: 'America/Sao_Paulo' };

export function toPromptPeriod(window: PeriodWindow, today: Date): PromptPeriod {
  return {
    referenceMonth: window.referenceMonth,
    startDate: window.startDate.toLocaleDateString('pt-BR', BRAZIL_DATE),
    endDate: window.endDate.toLocaleDateString('pt-BR', BRAZIL_DATE),
    daysLeft: daysLeftInPeriod(window, today),
  };
}
