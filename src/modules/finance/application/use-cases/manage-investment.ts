import { InvestmentRepository } from '../../domain/repositories/investment-repository';

export class CreateInvestmentUseCase {
  constructor(private repo: InvestmentRepository) {}
  async execute(data: any) {
    return this.repo.create(data);
  }
}
export class GetInvestmentUseCase {
  constructor(private repo: InvestmentRepository) {}
  async execute(id: string) {
    return this.repo.findById(id);
  }
}
export class UpdateInvestmentUseCase {
  constructor(private repo: InvestmentRepository) {}
  async execute(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
export class DeleteInvestmentUseCase {
  constructor(private repo: InvestmentRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}