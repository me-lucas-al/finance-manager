import { PeriodRepository } from '../../domain/repositories/period-repository';
import { SettingRepository } from '../../../users/domain/repositories/setting-repository';
import { getFinancialPeriod } from '../../domain/financial-period';

export class CreateFinancialPeriodUseCase {
  constructor(
    private periodRepo: PeriodRepository,
    private settingRepo: SettingRepository
  ) {}

  async execute(userId: string, date: Date) {
    const settings = await this.settingRepo.findByUserId(userId);
    const startDay = settings?.periodStartDay ?? 15;
    const endDay = settings?.periodEndDay ?? 14;

    const { start, end } = getFinancialPeriod(date, startDay, endDay);
    
    return this.periodRepo.create({
      userId,
      startDate: start,
      endDate: end,
      status: 'OPEN',
    });
  }
}