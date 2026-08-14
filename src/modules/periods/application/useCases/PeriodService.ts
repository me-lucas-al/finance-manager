import { IPeriodRepository, NewFinancialPeriod, FinancialPeriod } from '../../domain/repositories/IPeriodRepository';

export class PeriodService {
  constructor(private readonly periodRepository: IPeriodRepository) {}

  async createPeriod(data: NewFinancialPeriod): Promise<FinancialPeriod> {
    return this.periodRepository.create(data);
  }

  async getPeriodById(id: string, userId?: string): Promise<FinancialPeriod | null> {
    return this.periodRepository.findById(id, userId);
  }

  async getUserPeriods(userId: string): Promise<FinancialPeriod[]> {
    return this.periodRepository.findByUserId(userId);
  }

  async updatePeriod(id: string, data: Partial<NewFinancialPeriod>, userId?: string): Promise<FinancialPeriod> {
    return this.periodRepository.update(id, data, userId);
  }

  async deletePeriod(id: string, userId?: string): Promise<void> {
    return this.periodRepository.delete(id, userId);
  }
}
