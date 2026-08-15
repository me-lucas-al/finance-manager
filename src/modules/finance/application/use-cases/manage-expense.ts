import { ExpenseRepository, NewExpense } from '../../domain/repositories/expense-repository';

export class CreateExpenseUseCase {
  constructor(private repo: ExpenseRepository) {}
  async execute(data: Omit<NewExpense, 'id'>) {
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
  async execute(id: string, data: Partial<NewExpense>) {
    return this.repo.update(id, data);
  }
}
export class DeleteExpenseUseCase {
  constructor(private repo: ExpenseRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}