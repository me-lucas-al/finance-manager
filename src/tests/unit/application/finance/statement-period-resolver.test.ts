import { describe, it, expect, vi } from 'vitest';
import { createStatementPeriodResolver } from '@/modules/finance/application/services/statement-period-resolver';
import type { PeriodWindow } from '@/modules/periods/domain/period-window';

const octoberPeriod: PeriodWindow = {
  id: 'p-oct',
  referenceMonth: '2026-10',
  startDate: new Date(2026, 9, 15),
  endDate: new Date(2026, 10, 14, 23, 59, 59),
};

describe('createStatementPeriodResolver', () => {
  it('uses the dates of the financial period that starts in the month', async () => {
    const windowForMonth = vi.fn(async () => octoberPeriod);
    const resolve = createStatementPeriodResolver({ windowForMonth });

    const period = await resolve('user-1', '2026-10');

    expect(windowForMonth).toHaveBeenCalledWith('user-1', '2026-10');
    expect(period.range).toEqual({ from: '2026-10-15', to: '2026-11-14' });
    expect(period.label).toBe('Outubro de 2026 · 15/10 a 14/11');
  });

  it('falls back to the calendar month when no period starts in it', async () => {
    const resolve = createStatementPeriodResolver({ windowForMonth: async () => null });

    const period = await resolve('user-1', '2026-02');

    expect(period.range).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(period.label).toBe('Fevereiro de 2026');
  });
});
