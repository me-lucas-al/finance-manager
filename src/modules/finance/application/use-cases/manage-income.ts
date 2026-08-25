import { IncomeRepository, NewIncome } from '../../domain/repositories/income-repository';

export class CreateIncomeUseCase {
  constructor(private repo: IncomeRepository) {}
  async execute(data: Omit<NewIncome, 'id'>) {
    return this.repo.create(data);
  }
}
export class GetIncomeUseCase {
  constructor(private repo: IncomeRepository) {}
  async execute(id: string) {
    return this.repo.findById(id);
  }
}
export class UpdateIncomeUseCase {
  constructor(private repo: IncomeRepository) {}
  async execute(id: string, data: Partial<NewIncome>) {
    return this.repo.update(id, data);
  }
}
export class DeleteIncomeUseCase {
  constructor(private repo: IncomeRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}