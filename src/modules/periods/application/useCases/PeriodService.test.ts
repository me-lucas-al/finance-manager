import { describe, it, expect, beforeEach } from 'vitest';
import { PeriodService } from './PeriodService';
import { IPeriodRepository, NewFinancialPeriod, FinancialPeriod } from '../../domain/repositories/IPeriodRepository';

class MockPeriodRepository implements IPeriodRepository {
  private periods: FinancialPeriod[] = [];

  async create(data: NewFinancialPeriod): Promise<FinancialPeriod> {
    const period: FinancialPeriod = {
      id: data.id ?? Math.random().toString(),
      userId: data.userId,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      closedAt: data.closedAt ?? null,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.periods.push(period);
    return period;
  }

  async findById(id: string): Promise<FinancialPeriod | null> {
    return this.periods.find((p) => p.id === id) || null;
  }

  async findByUserId(userId: string): Promise<FinancialPeriod[]> {
    return this.periods.filter((p) => p.userId === userId);
  }

  async update(id: string, data: Partial<NewFinancialPeriod>): Promise<FinancialPeriod> {
    const index = this.periods.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Financial period not found');
    this.periods[index] = { ...this.periods[index], ...data, updatedAt: new Date() };
    return this.periods[index];
  }

  async delete(id: string): Promise<void> {
    this.periods = this.periods.filter((p) => p.id !== id);
  }
}

describe('PeriodService', () => {
  let repository: MockPeriodRepository;
  let service: PeriodService;

  beforeEach(() => {
    repository = new MockPeriodRepository();
    service = new PeriodService(repository);
  });

  it('should create a period', async () => {
    const period = await service.createPeriod({
      userId: 'user-1',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
      status: 'open',
    });

    expect(period).toHaveProperty('id');
    expect(period.status).toBe('open');
  });

  it('should update a period', async () => {
    const created = await service.createPeriod({
      userId: 'user-1',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
      status: 'open',
    });

    const updated = await service.updatePeriod(created.id, { status: 'closed', closedAt: new Date() });
    expect(updated.status).toBe('closed');
    expect(updated.closedAt).not.toBeNull();
  });

  it('should list user periods', async () => {
    await service.createPeriod({
      userId: 'user-1',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
      status: 'open',
    });

    const periods = await service.getUserPeriods('user-1');
    expect(periods).toHaveLength(1);
    expect(periods[0].userId).toBe('user-1');
  });

  it('should delete a period', async () => {
    const created = await service.createPeriod({
      userId: 'user-1',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
      status: 'open',
    });

    await service.deletePeriod(created.id);
    const periods = await service.getUserPeriods('user-1');
    expect(periods).toHaveLength(0);
  });
});
