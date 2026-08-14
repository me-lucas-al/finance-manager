import { describe, it, expect, beforeEach } from 'vitest';
import { IncomeService } from './IncomeService';
import { IIncomeRepository, NewIncome, Income } from '../../domain/repositories/IIncomeRepository';

class MockIncomeRepository implements IIncomeRepository {
  private incomes: Income[] = [];

  async create(data: NewIncome): Promise<Income> {
    const income: Income = {
      id: data.id ?? Math.random().toString(),
      userId: data.userId,
      periodId: data.periodId,
      description: data.description,
      amount: data.amount,
      category: data.category,
      receivedAt: data.receivedAt,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.incomes.push(income);
    return income;
  }

  async findById(id: string): Promise<Income | null> {
    return this.incomes.find((i) => i.id === id) || null;
  }

  async findByPeriodId(periodId: string): Promise<Income[]> {
    return this.incomes.filter((i) => i.periodId === periodId);
  }

  async update(id: string, data: Partial<NewIncome>): Promise<Income> {
    const index = this.incomes.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Income not found');
    this.incomes[index] = { ...this.incomes[index], ...data, updatedAt: new Date() };
    return this.incomes[index];
  }

  async delete(id: string): Promise<void> {
    this.incomes = this.incomes.filter((i) => i.id !== id);
  }
}

describe('IncomeService', () => {
  let repository: MockIncomeRepository;
  let service: IncomeService;

  beforeEach(() => {
    repository = new MockIncomeRepository();
    service = new IncomeService(repository);
  });

  it('should create an income', async () => {
    const income = await service.createIncome({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Salary',
      amount: 500000,
      category: 'salary',
      receivedAt: new Date(),
    });

    expect(income).toHaveProperty('id');
    expect(income.amount).toBe(500000);
  });

  it('should list incomes by period', async () => {
    await service.createIncome({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Salary',
      amount: 500000,
      category: 'salary',
      receivedAt: new Date(),
    });

    const incomes = await service.getIncomesByPeriod('period-1');
    expect(incomes).toHaveLength(1);
  });

  it('should update an income', async () => {
    const created = await service.createIncome({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Salary',
      amount: 500000,
      category: 'salary',
      receivedAt: new Date(),
    });

    const updated = await service.updateIncome(created.id, { amount: 600000 });
    expect(updated.amount).toBe(600000);
  });

  it('should delete an income', async () => {
    const created = await service.createIncome({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Salary',
      amount: 500000,
      category: 'salary',
      receivedAt: new Date(),
    });

    await service.deleteIncome(created.id);
    const incomes = await service.getIncomesByPeriod('period-1');
    expect(incomes).toHaveLength(0);
  });

  it('should get an income by id', async () => {
    const created = await service.createIncome({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Salary',
      amount: 500000,
      category: 'salary',
      receivedAt: new Date(),
    });

    const found = await service.getIncomeById(created.id);
    expect(found?.description).toBe('Salary');
  });
});
