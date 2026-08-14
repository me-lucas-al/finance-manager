import { describe, it, expect, beforeEach } from 'vitest';
import { InvestmentService } from './InvestmentService';
import { IInvestmentRepository, NewInvestment, Investment } from '../../domain/repositories/IInvestmentRepository';

class MockInvestmentRepository implements IInvestmentRepository {
  private investments: Investment[] = [];

  async create(data: NewInvestment): Promise<Investment> {
    const investment: Investment = {
      id: data.id ?? Math.random().toString(),
      userId: data.userId,
      periodId: data.periodId,
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: data.date,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.investments.push(investment);
    return investment;
  }

  async findById(id: string): Promise<Investment | null> {
    return this.investments.find((i) => i.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Investment[]> {
    return this.investments.filter((i) => i.userId === userId);
  }

  async findByPeriodId(periodId: string): Promise<Investment[]> {
    return this.investments.filter((i) => i.periodId === periodId);
  }

  async update(id: string, data: Partial<NewInvestment>): Promise<Investment> {
    const index = this.investments.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Investment not found');
    this.investments[index] = { ...this.investments[index], ...data, updatedAt: new Date() };
    return this.investments[index];
  }

  async delete(id: string): Promise<void> {
    this.investments = this.investments.filter((i) => i.id !== id);
  }
}

describe('InvestmentService', () => {
  let repository: MockInvestmentRepository;
  let service: InvestmentService;

  beforeEach(() => {
    repository = new MockInvestmentRepository();
    service = new InvestmentService(repository);
  });

  it('should create an investment', async () => {
    const investment = await service.createInvestment({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Stocks',
      amount: 100000,
      type: 'stocks',
      date: new Date(),
    });

    expect(investment).toHaveProperty('id');
    expect(investment.amount).toBe(100000);
  });

  it('should list investments by user', async () => {
    await service.createInvestment({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Stocks',
      amount: 100000,
      type: 'stocks',
      date: new Date(),
    });

    const investments = await service.getInvestmentsByUser('user-1');
    expect(investments).toHaveLength(1);
  });

  it('should update an investment', async () => {
    const created = await service.createInvestment({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Stocks',
      amount: 100000,
      type: 'stocks',
      date: new Date(),
    });

    const updated = await service.updateInvestment(created.id, { amount: 150000 });
    expect(updated.amount).toBe(150000);
  });

  it('should delete an investment', async () => {
    const created = await service.createInvestment({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Stocks',
      amount: 100000,
      type: 'stocks',
      date: new Date(),
    });

    await service.deleteInvestment(created.id);
    const investments = await service.getInvestmentsByUser('user-1');
    expect(investments).toHaveLength(0);
  });

  it('should get an investment by id', async () => {
    const created = await service.createInvestment({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Stocks',
      amount: 100000,
      type: 'stocks',
      date: new Date(),
    });

    const found = await service.getInvestmentById(created.id);
    expect(found?.description).toBe('Stocks');
  });

  it('should get investments by period', async () => {
    await service.createInvestment({
      userId: 'user-1',
      periodId: 'period-1',
      description: 'Stocks',
      amount: 100000,
      type: 'stocks',
      date: new Date(),
    });

    const found = await service.getInvestmentsByPeriod('period-1');
    expect(found).toHaveLength(1);
  });
});
