import { IIncomeRepository, NewIncome, Income } from '../../domain/repositories/IIncomeRepository';

export class IncomeService {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async createIncome(data: NewIncome): Promise<Income> {
    return this.incomeRepository.create(data);
  }

  async getIncomeById(id: string): Promise<Income | null> {
    return this.incomeRepository.findById(id);
  }

  async getIncomesByPeriod(periodId: string): Promise<Income[]> {
    return this.incomeRepository.findByPeriodId(periodId);
  }

  async updateIncome(id: string, data: Partial<NewIncome>): Promise<Income> {
    return this.incomeRepository.update(id, data);
  }

  async deleteIncome(id: string): Promise<void> {
    return this.incomeRepository.delete(id);
  }
}
