import { PeriodRepository, NewPeriod } from '../../domain/repositories/period-repository';

export class CreatePeriodUseCase {
  constructor(private repo: PeriodRepository) {}
  async execute(data: Omit<NewPeriod, 'id'>) {
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
  async execute(id: string, data: Partial<NewPeriod>) {
    return this.repo.update(id, data);
  }
}
export class DeletePeriodUseCase {
  constructor(private repo: PeriodRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}