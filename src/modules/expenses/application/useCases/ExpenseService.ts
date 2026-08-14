import { IExpenseRepository, NewExpense, Expense } from '../../domain/repositories/IExpenseRepository';

export class ExpenseService {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async createExpense(data: NewExpense): Promise<Expense> {
    return this.expenseRepository.create(data);
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    return this.expenseRepository.findById(id);
  }

  async getExpensesByPeriod(periodId: string): Promise<Expense[]> {
    return this.expenseRepository.findByPeriodId(periodId);
  }

  async updateExpense(id: string, data: Partial<NewExpense>): Promise<Expense> {
    return this.expenseRepository.update(id, data);
  }

  async deleteExpense(id: string): Promise<void> {
    return this.expenseRepository.delete(id);
  }
}
