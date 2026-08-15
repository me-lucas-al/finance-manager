import { describe, it, expect, beforeEach } from 'vitest';
import { CreateFinancialPeriodUseCase } from '../../../../modules/periods/application/use-cases/create-financial-period';
import { FakePeriodRepository } from './fake-period-repository';
import { FakeSettingRepository } from '../users/fake-setting-repository';

describe('CreateFinancialPeriodUseCase', () => {
  let periodRepo: FakePeriodRepository;
  let settingRepo: FakeSettingRepository;
  let useCase: CreateFinancialPeriodUseCase;

  beforeEach(() => {
    periodRepo = new FakePeriodRepository();
    settingRepo = new FakeSettingRepository();
    useCase = new CreateFinancialPeriodUseCase(periodRepo, settingRepo);
  });

  it('should create period with default settings if no settings found', async () => {
    const date = new Date(2026, 9, 15); // Oct 15
    const period = await useCase.execute('user-1', date);
    
    expect(period.startDate.getDate()).toBe(15);
    expect(period.endDate.getDate()).toBe(14);
  });

  it('should create period with user settings', async () => {
    await settingRepo.create({ userId: 'user-1', periodStartDay: 1, periodEndDay: 30 });
    const date = new Date(2026, 9, 15); // Oct 15
    const period = await useCase.execute('user-1', date);
    
    expect(period.startDate.getDate()).toBe(1);
    expect(period.endDate.getDate()).toBe(30);
  });
});