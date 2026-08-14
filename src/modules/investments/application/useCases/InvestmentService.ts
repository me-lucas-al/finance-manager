import { IInvestmentRepository, NewInvestment, Investment } from '../../domain/repositories/IInvestmentRepository';

export class InvestmentService {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async createInvestment(data: NewInvestment): Promise<Investment> {
    return this.investmentRepository.create(data);
  }

  async getInvestmentById(id: string, userId: string): Promise<Investment | null> {
    return this.investmentRepository.findById(id, userId);
  }

  async getInvestmentsByUser(userId: string): Promise<Investment[]> {
    return this.investmentRepository.findByUserId(userId);
  }

  async getInvestmentsByPeriod(periodId: string, userId: string): Promise<Investment[]> {
    return this.investmentRepository.findByPeriodId(periodId, userId);
  }

  async updateInvestment(id: string, userId: string, data: Partial<NewInvestment>): Promise<Investment> {
    return this.investmentRepository.update(id, userId, data);
  }

  async deleteInvestment(id: string, userId: string): Promise<void> {
    return this.investmentRepository.delete(id, userId);
  }
}
