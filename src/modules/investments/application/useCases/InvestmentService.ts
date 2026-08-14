import { IInvestmentRepository, NewInvestment, Investment } from '../../domain/repositories/IInvestmentRepository';

export class InvestmentService {
  constructor(private readonly investmentRepository: IInvestmentRepository) {}

  async createInvestment(data: NewInvestment): Promise<Investment> {
    return this.investmentRepository.create(data);
  }

  async getInvestmentById(id: string): Promise<Investment | null> {
    return this.investmentRepository.findById(id);
  }

  async getInvestmentsByUser(userId: string): Promise<Investment[]> {
    return this.investmentRepository.findByUserId(userId);
  }

  async updateInvestment(id: string, data: Partial<NewInvestment>): Promise<Investment> {
    return this.investmentRepository.update(id, data);
  }

  async deleteInvestment(id: string): Promise<void> {
    return this.investmentRepository.delete(id);
  }
}
