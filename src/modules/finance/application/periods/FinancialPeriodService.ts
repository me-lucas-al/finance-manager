import { FinancialPeriod } from '../../domain/FinancialPeriod';

export interface IPeriodRepository {
  findByExactDates(userId: string, startDate: Date, endDate: Date): Promise<{ id: string } | null>;
  create(userId: string, startDate: Date, endDate: Date): Promise<{ id: string }>;
}

export interface IUserSettingsRepository {
  getSettingsByUserId(userId: string): Promise<{ periodStartDay: number; periodEndDay: number }>;
}

export class FinancialPeriodService {
  constructor(
    private readonly periodRepository: IPeriodRepository,
    private readonly userSettingsRepository: IUserSettingsRepository
  ) {}

  public determinePeriodForDate(date: Date, startDay: number, endDay: number): FinancialPeriod {
    const year = date.getUTCFullYear();
    const monthIndex = date.getUTCMonth(); // 0-11
    const day = date.getUTCDate();

    let targetYear = year;
    let targetMonth = monthIndex + 1; // 1-12

    if (day < startDay) {
      // It belongs to the previous month's period
      targetMonth -= 1;
      if (targetMonth === 0) {
        targetMonth = 12;
        targetYear -= 1;
      }
    }

    return new FinancialPeriod(startDay, endDay, targetYear, targetMonth);
  }

  public async getOrCreatePeriodForDate(userId: string, date: Date): Promise<{ id: string }> {
    const settings = await this.userSettingsRepository.getSettingsByUserId(userId);
    const period = this.determinePeriodForDate(date, settings.periodStartDay, settings.periodEndDay);

    const existingPeriod = await this.periodRepository.findByExactDates(userId, period.startDate, period.endDate);
    if (existingPeriod) {
      return existingPeriod;
    }

    return this.periodRepository.create(userId, period.startDate, period.endDate);
  }

  public async createNextPeriod(userId: string, currentDate: Date): Promise<{ id: string }> {
    const settings = await this.userSettingsRepository.getSettingsByUserId(userId);
    const currentPeriod = this.determinePeriodForDate(currentDate, settings.periodStartDay, settings.periodEndDay);

    let nextMonth = currentPeriod.month + 1;
    let nextYear = currentPeriod.year;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    const nextPeriod = new FinancialPeriod(settings.periodStartDay, settings.periodEndDay, nextYear, nextMonth);

    const existingPeriod = await this.periodRepository.findByExactDates(userId, nextPeriod.startDate, nextPeriod.endDate);
    if (existingPeriod) {
      return existingPeriod;
    }

    return this.periodRepository.create(userId, nextPeriod.startDate, nextPeriod.endDate);
  }
}
