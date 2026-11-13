import { describe, it, expect } from 'vitest';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { FakePeriodRepository } from '@/tests/fakes/fake-period-repository';
import { FakeSettingRepository } from '@/tests/fakes/fake-setting-repository';
import { calculateFinancialSnapshot } from '@/modules/finance/domain/services/calculate-financial-snapshot';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { EMPTY_PORTFOLIO } from '@/modules/finance/domain/models/portfolio';

describe('Month transition period reset integration', () => {
  it('closes expired period and starts fresh month without repeating previous salary', async () => {
    const periodRepo = new FakePeriodRepository();
    const settingRepo = new FakeSettingRepository();
    const useCase = new ResolveCurrentPeriodUseCase(periodRepo, settingRepo);
    const userId = 'user-reset-test';

    const marchPeriod = await periodRepo.create({
      userId,
      status: 'OPEN',
      startDate: new Date('2026-03-01T00:00:00Z'),
      endDate: new Date('2026-03-31T23:59:59Z'),
    });

    const entries: LedgerEntry[] = [
      {
        id: 'inc-march',
        kind: 'income',
        amount: 8500,
        category: 'Salário',
        description: 'Salário Março',
        account: 'Conta Corrente',
        date: '2026-03-05',
        fixed: false,
      },
    ];

    const aprilDate = new Date('2026-04-01T12:00:00Z');
    const resolvedAprilPeriod = await useCase.execute(userId, aprilDate);

    expect(resolvedAprilPeriod.id).not.toBe(marchPeriod.id);
    expect(resolvedAprilPeriod.status).toBe('OPEN');

    const updatedMarch = await periodRepo.findById(marchPeriod.id);
    expect(updatedMarch?.status).toBe('CLOSED');

    const aprilSnapshot = calculateFinancialSnapshot({
      entries,
      goals: [],
      referenceMonth: '2026-04',
      portfolio: EMPTY_PORTFOLIO,
    });

    expect(aprilSnapshot.currentMonth.totalIncome).toBe(0);
    expect(aprilSnapshot.previousMonth.totalIncome).toBe(8500);
  });
});
