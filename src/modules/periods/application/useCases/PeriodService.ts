import { IPeriodRepository, NewFinancialPeriod, FinancialPeriod } from '../../domain/repositories/IPeriodRepository';

export class PeriodService {
  constructor(private readonly periodRepository: IPeriodRepository) {}

  async createPeriod(data: NewFinancialPeriod): Promise<FinancialPeriod> {
    return this.periodRepository.create(data);
  }

  async getPeriodById(id: string): Promise<FinancialPeriod | null> {
    return this.periodRepository.findById(id);
  }

  async getUserPeriods(userId: string): Promise<FinancialPeriod[]> {
    return this.periodRepository.findByUserId(userId);
  }

  async updatePeriod(id: string, data: Partial<NewFinancialPeriod>): Promise<FinancialPeriod> {
    return this.periodRepository.update(id, data);
  }

  async deletePeriod(id: string): Promise<void> {
    return this.periodRepository.delete(id);
  }
}
