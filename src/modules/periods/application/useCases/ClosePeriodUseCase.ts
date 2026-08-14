import { IPeriodRepository, FinancialPeriod } from '../../domain/repositories/IPeriodRepository';
import { FinancialPeriodService } from '../../../finance/application/periods/FinancialPeriodService';

export class PeriodAlreadyClosedError extends Error {
  constructor() {
    super('Period is already closed');
    this.name = 'PeriodAlreadyClosedError';
  }
}

export class ClosePeriodUseCase {
  constructor(
    private readonly periodRepository: IPeriodRepository,
    private readonly financialPeriodService: FinancialPeriodService
  ) {}

  async execute(periodId: string): Promise<FinancialPeriod> {
    const period = await this.periodRepository.findById(periodId);
    if (!period) {
      throw new Error('Period not found');
    }

    if (period.status === 'closed') {
      throw new PeriodAlreadyClosedError();
    }

    const nextPeriodData = await this.financialPeriodService.determineNextPeriodData(period.userId, period.endDate);

    if (this.periodRepository.closePeriodAndCreateNext) {
      return this.periodRepository.closePeriodAndCreateNext(periodId, nextPeriodData as import('../../domain/repositories/IPeriodRepository').NewFinancialPeriod);
    }

    // Fallback without transaction
    const closedPeriod = await this.periodRepository.update(periodId, {
      status: 'closed',
      closedAt: new Date()
    });

    try {
      await this.financialPeriodService.createNextPeriod(period.userId, period.endDate);
    } catch (error) {
      throw error;
    }

    return closedPeriod;
  }
}
