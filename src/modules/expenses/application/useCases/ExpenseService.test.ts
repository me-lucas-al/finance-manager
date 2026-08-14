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

  async findById(id: string, userId: string): Promise<Expense | null> {
    const expense = this.expenses.find(e => e.id === id && e.userId === userId);
    return expense || null;
  }

  async findByPeriodId(periodId: string, userId: string): Promise<Expense[]> {
    return this.expenses.filter(e => e.periodId === periodId && e.userId === userId);
  }

  async update(id: string, userId: string, data: Partial<NewExpense>): Promise<Expense> {
    const index = this.expenses.findIndex(e => e.id === id && e.userId === userId);
    if (index === -1) throw new Error('Expense not found');
    this.expenses[index] = { ...this.expenses[index], ...data, updatedAt: new Date() };
    return this.expenses[index];
  }

  async delete(id: string, userId: string): Promise<void> {
    this.expenses = this.expenses.filter((e) => !(e.id === id && e.userId === userId));
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

    const expenses = await service.getExpensesByPeriod('period-1', 'user-1');
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

    const updated = await service.updateExpense(created.id, 'user-1', { amount: 20000 });
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

    await service.deleteExpense(created.id, 'user-1');
    const expenses = await service.getExpensesByPeriod('period-1', 'user-1');
    expect(expenses).toHaveLength(0);
  });

  it('should get an expense by id', async () => {
    const created = await service.createExpense({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Groceries',
      amount: 15000,
      category: 'food',
      date: new Date(),
    });

    const found = await service.getExpenseById(created.id, 'user-1');
    expect(found?.description).toBe('Groceries');
  });
});
