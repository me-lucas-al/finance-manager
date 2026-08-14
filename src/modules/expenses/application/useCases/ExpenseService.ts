import { IExpenseRepository, NewExpense, Expense } from '../../domain/repositories/IExpenseRepository';

export class ExpenseService {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async createExpense(data: NewExpense): Promise<Expense> {
    return this.expenseRepository.create(data);
  }

  async getExpenseById(id: string, userId: string): Promise<Expense | null> {
    return this.expenseRepository.findById(id, userId);
  }

  async getExpensesByPeriod(periodId: string, userId: string): Promise<Expense[]> {
    return this.expenseRepository.findByPeriodId(periodId, userId);
  }

  async updateExpense(id: string, userId: string, data: Partial<NewExpense>): Promise<Expense> {
    return this.expenseRepository.update(id, userId, data);
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    return this.expenseRepository.delete(id, userId);
  }
}
