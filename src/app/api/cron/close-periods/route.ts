import { NextResponse } from 'next/server';
import { ClosePeriodUseCase } from '../../../../modules/periods/application/useCases/ClosePeriodUseCase';
import { PeriodDrizzleRepository } from '../../../../modules/periods/infra/repositories/PeriodDrizzleRepository';
import { FinancialPeriodService } from '../../../../modules/finance/application/periods/FinancialPeriodService';
import { UserSettingsDrizzleRepository } from '../../../../modules/users/infra/repositories/UserSettingsDrizzleRepository';

// Wrappers needed because the FinancialPeriodService expects slightly different interfaces
class UserSettingsRepoWrapper {
  constructor(private repo: UserSettingsDrizzleRepository) {}
  async getSettingsByUserId(userId: string) {
    const settings = await this.repo.findByUserId(userId);
    if (!settings) throw new Error('User settings not found');
    return {
      periodStartDay: settings.periodStartDay,
      periodEndDay: settings.periodEndDay,
    };
  }
}

class PeriodRepoWrapper {
  constructor(private repo: PeriodDrizzleRepository) {}
  async findByExactDates(userId: string, startDate: Date, endDate: Date) {
    return this.repo.findByExactDates(userId, startDate, endDate);
  }
  async create(userId: string, startDate: Date, endDate: Date) {
    return this.repo.create({ userId, startDate, endDate, status: 'open' });
  }
}

export async function GET(req: Request) {
  // Check the Vercel Cron authorization header
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const periodRepository = new PeriodDrizzleRepository();
    const userSettingsRepository = new UserSettingsRepoWrapper(new UserSettingsDrizzleRepository());
    const financialPeriodService = new FinancialPeriodService(
      new PeriodRepoWrapper(periodRepository),
      userSettingsRepository
    );
    const closePeriodUseCase = new ClosePeriodUseCase(periodRepository, financialPeriodService);

    if (!periodRepository.findEndedOpenPeriods) {
      throw new Error('findEndedOpenPeriods not implemented');
    }

    // Get all ended periods that are still open
    const currentDate = new Date();
    const endedPeriods = await periodRepository.findEndedOpenPeriods(currentDate);

    let closedCount = 0;
    const errors: { id: string; error: string }[] = [];

    // Idempotent execution
    for (const period of endedPeriods) {
      try {
        await closePeriodUseCase.execute(period.id);
        closedCount++;
      } catch (err) {
        console.error(`Failed to close period ${period.id}:`, err);
        errors.push({ id: period.id, error: err instanceof Error ? err.message : String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      processed: endedPeriods.length,
      closed: closedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
