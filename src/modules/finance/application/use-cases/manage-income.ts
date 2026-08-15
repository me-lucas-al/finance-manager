import { IncomeRepository } from '../../domain/repositories/income-repository';

export class CreateIncomeUseCase {
  constructor(private repo: IncomeRepository) {}
  async execute(data: any) {
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
  async execute(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
export class DeleteIncomeUseCase {
  constructor(private repo: IncomeRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}