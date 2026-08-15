import { PeriodRepository } from '../../domain/repositories/period-repository';

export class CreatePeriodUseCase {
  constructor(private repo: PeriodRepository) {}
  async execute(data: any) {
    return this.repo.create(data);
  }
}
export class GetPeriodUseCase {
  constructor(private repo: PeriodRepository) {}
  async execute(id: string) {
    return this.repo.findById(id);
  }
}
export class UpdatePeriodUseCase {
  constructor(private repo: PeriodRepository) {}
  async execute(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
export class DeletePeriodUseCase {
  constructor(private repo: PeriodRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}