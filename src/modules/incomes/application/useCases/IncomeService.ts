import { IIncomeRepository, NewIncome, Income } from '../../domain/repositories/IIncomeRepository';

export class IncomeService {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async createIncome(data: NewIncome): Promise<Income> {
    return this.incomeRepository.create(data);
  }

  async getIncomeById(id: string, userId: string): Promise<Income | null> {
    return this.incomeRepository.findById(id, userId);
  }

  async getIncomesByPeriod(periodId: string, userId: string): Promise<Income[]> {
    return this.incomeRepository.findByPeriodId(periodId, userId);
  }

  async updateIncome(id: string, userId: string, data: Partial<NewIncome>): Promise<Income> {
    return this.incomeRepository.update(id, userId, data);
  }

  async deleteIncome(id: string, userId: string): Promise<void> {
    return this.incomeRepository.delete(id, userId);
  }
}
