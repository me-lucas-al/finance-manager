import { PeriodRepository } from '../../domain/repositories/period-repository';
import { SettingRepository } from '../../../users/domain/repositories/setting-repository';
import { getFinancialPeriod } from '../../domain/financial-period';

export class ResolveCurrentPeriodUseCase {
  constructor(
    private periodRepo: PeriodRepository,
    private settingRepo: SettingRepository
  ) {}

  async forDate(userId: string, date: Date) {
    const containing = await this.periodRepo.findContaining(userId, date);
    return containing ?? this.execute(userId, date);
  }

  async execute(userId: string, referenceDate: Date = new Date()) {
    const existingOpen = await this.periodRepo.findOpenByUserId(userId);
    if (existingOpen) {
      if (new Date(existingOpen.endDate) >= referenceDate) return existingOpen;
      await this.periodRepo.update(existingOpen.id, { status: 'CLOSED' });
    }

    const settings = await this.settingRepo.findByUserId(userId);
    const startDay = settings?.periodStartDay ?? 15;
    const endDay = settings?.periodEndDay ?? 14;

    const { start, end } = getFinancialPeriod(referenceDate, startDay, endDay);

    return this.periodRepo.findOrCreateOpenPeriod({
      userId,
      startDate: start,
      endDate: end,
    });
  }
}
