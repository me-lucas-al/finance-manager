import { PeriodRepository } from '../../domain/repositories/period-repository';
import { SettingRepository } from '../../../users/domain/repositories/setting-repository';
import { getFinancialPeriod } from '../../domain/financial-period';

export class ResolveCurrentPeriodUseCase {
  constructor(
    private periodRepo: PeriodRepository,
    private settingRepo: SettingRepository
  ) {}

  async execute(userId: string, referenceDate: Date = new Date()) {
    const existingOpen = await this.periodRepo.findOpenByUserId(userId);
    if (existingOpen) return existingOpen;

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
