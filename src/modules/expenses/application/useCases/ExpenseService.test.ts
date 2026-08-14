import { describe, it, expect, beforeEach } from 'vitest';
import { ExpenseService } from './ExpenseService';
import { IExpenseRepository, NewExpense, Expense } from '../../domain/repositories/IExpenseRepository';

class MockExpenseRepository implements IExpenseRepository {
  private expenses: Expense[] = [];

  async create(data: NewExpense): Promise<Expense> {
    const expense: Expense = {
      id: data.id ?? Math.random().toString(),
      userId: data.userId,
      periodId: data.periodId,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.expenses.push(expense);
    return expense;
  }

  async findById(id: string): Promise<Expense | null> {
    return this.expenses.find((e) => e.id === id) || null;
  }

  async findByPeriodId(periodId: string): Promise<Expense[]> {
    return this.expenses.filter((e) => e.periodId === periodId);
  }

  async update(id: string, data: Partial<NewExpense>): Promise<Expense> {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Expense not found');
    this.expenses[index] = { ...this.expenses[index], ...data, updatedAt: new Date() };
    return this.expenses[index];
  }

  async delete(id: string): Promise<void> {
    this.expenses = this.expenses.filter((e) => e.id !== id);
  }
}

describe('ExpenseService', () => {
  let repository: MockExpenseRepository;
  let service: ExpenseService;

  beforeEach(() => {
    repository = new MockExpenseRepository();
    service = new ExpenseService(repository);
  });

  it('should create an expense', async () => {
    const expense = await service.createExpense({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Groceries',
      amount: 15000,
      category: 'food',
      date: new Date(),
    });

    expect(expense).toHaveProperty('id');
    expect(expense.amount).toBe(15000);
  });

  it('should list expenses by period', async () => {
    await service.createExpense({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Groceries',
      amount: 15000,
      category: 'food',
      date: new Date(),
    });

    const expenses = await service.getExpensesByPeriod('period-1');
    expect(expenses).toHaveLength(1);
  });

  it('should update an expense', async () => {
    const created = await service.createExpense({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Groceries',
      amount: 15000,
      category: 'food',
      date: new Date(),
    });

    const updated = await service.updateExpense(created.id, { amount: 20000 });
    expect(updated.amount).toBe(20000);
  });

  it('should delete an expense', async () => {
    const created = await service.createExpense({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Groceries',
      amount: 15000,
      category: 'food',
      date: new Date(),
    });

    await service.deleteExpense(created.id);
    const expenses = await service.getExpensesByPeriod('period-1');
    expect(expenses).toHaveLength(0);
  });
});
