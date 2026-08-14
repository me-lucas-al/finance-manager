'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '../../../../lib/session';
import { ClosePeriodUseCase } from '../../application/useCases/ClosePeriodUseCase';
import { PeriodDrizzleRepository } from '../../infra/repositories/PeriodDrizzleRepository';
import { FinancialPeriodService } from '../../../finance/application/periods/FinancialPeriodService';
import { UserSettingsDrizzleRepository } from '../../../users/infra/repositories/UserSettingsDrizzleRepository';

// Wrapper for UserSettingsDrizzleRepository to match IUserSettingsRepository
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

// Initialize dependencies
const periodRepository = new PeriodDrizzleRepository();
const userSettingsRepository = new UserSettingsRepoWrapper(new UserSettingsDrizzleRepository());
const financialPeriodService = new FinancialPeriodService(new PeriodRepoWrapper(periodRepository), userSettingsRepository);
const closePeriodUseCase = new ClosePeriodUseCase(periodRepository, financialPeriodService);

export async function closePeriodAction(periodId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: 'Unauthorized' };
    }

    // Verify if the period belongs to the user
    const period = await periodRepository.findById(periodId);
    if (!period || period.userId !== session.userId) {
       return { success: false, message: 'Period not found or access denied' };
    }

    await closePeriodUseCase.execute(periodId);

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/analytics');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'PeriodAlreadyClosedError') {
       return { success: false, message: 'Period is already closed' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Failed to close period' };
  }
}
