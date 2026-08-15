import { describe, it, expect, beforeEach } from 'vitest';
import { ResolveCurrentPeriodUseCase } from '../../../../modules/periods/application/use-cases/resolve-current-period';
import { FakePeriodRepository } from './fake-period-repository';
import { FakeSettingRepository } from '../users/fake-setting-repository';

describe('ResolveCurrentPeriodUseCase', () => {
  let periodRepo: FakePeriodRepository;
  let settingRepo: FakeSettingRepository;
  let useCase: ResolveCurrentPeriodUseCase;

  beforeEach(() => {
    periodRepo = new FakePeriodRepository();
    settingRepo = new FakeSettingRepository();
    useCase = new ResolveCurrentPeriodUseCase(periodRepo, settingRepo);
  });

  it('should create a new OPEN period when none exists', async () => {
    const date = new Date(2026, 9, 20); // Oct 20, 2026
    const period = await useCase.execute('user-1', date);

    expect(period.status).toBe('OPEN');
    expect(period.userId).toBe('user-1');
    expect(period.startDate.getDate()).toBe(15);
  });

  it('should reuse the existing OPEN period instead of creating a duplicate', async () => {
    const date = new Date(2026, 9, 20);
    const first = await useCase.execute('user-1', date);
    const second = await useCase.execute('user-1', date);

    expect(second.id).toBe(first.id);
  });

  it('should not leak periods between users', async () => {
    const date = new Date(2026, 9, 20);
    const periodA = await useCase.execute('user-a', date);
    const periodB = await useCase.execute('user-b', date);

    expect(periodA.id).not.toBe(periodB.id);
    expect(periodA.userId).toBe('user-a');
    expect(periodB.userId).toBe('user-b');
  });

  it('should use the user configured start/end days', async () => {
    await settingRepo.create({ userId: 'user-1', periodStartDay: 1, periodEndDay: 30 });
    const date = new Date(2026, 9, 20);
    const period = await useCase.execute('user-1', date);

    expect(period.startDate.getDate()).toBe(1);
    expect(period.endDate.getDate()).toBe(30);
  });
});
