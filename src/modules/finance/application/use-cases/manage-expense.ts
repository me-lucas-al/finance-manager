import { ExpenseRepository } from '../../domain/repositories/expense-repository';

export class CreateExpenseUseCase {
  constructor(private repo: ExpenseRepository) {}
  async execute(data: any) {
    return this.repo.create(data);
  }
}
export class GetExpenseUseCase {
  constructor(private repo: ExpenseRepository) {}
  async execute(id: string) {
    return this.repo.findById(id);
  }
}
export class UpdateExpenseUseCase {
  constructor(private repo: ExpenseRepository) {}
  async execute(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
export class DeleteExpenseUseCase {
  constructor(private repo: ExpenseRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}