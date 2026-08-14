import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClosePeriodUseCase, PeriodAlreadyClosedError } from './ClosePeriodUseCase';
import { IPeriodRepository, FinancialPeriod } from '../../domain/repositories/IPeriodRepository';
import { FinancialPeriodService } from '../../../finance/application/periods/FinancialPeriodService';

describe('ClosePeriodUseCase', () => {
  let periodRepository: import('vitest').Mocked<IPeriodRepository>;
  let financialPeriodService: import('vitest').Mocked<FinancialPeriodService>;
  let useCase: ClosePeriodUseCase;

  beforeEach(() => {
    periodRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      closePeriodTransaction: vi.fn(),
      closePeriodAndCreateNext: vi.fn(),
    } as unknown as import('vitest').Mocked<IPeriodRepository>;

    financialPeriodService = {
      createNextPeriod: vi.fn(),
      determineNextPeriodData: vi.fn(),
    } as unknown as import('vitest').Mocked<FinancialPeriodService>;

    useCase = new ClosePeriodUseCase(periodRepository, financialPeriodService);
  });

  it('should close an open period normally and create the next period', async () => {
    const mockPeriod: FinancialPeriod = {
      id: 'period-1',
      userId: 'user-1',
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-08-31T23:59:59Z'),
      status: 'open',
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    periodRepository.findById.mockResolvedValue(mockPeriod);
    financialPeriodService.determineNextPeriodData.mockResolvedValue({
        userId: 'user-1',
        startDate: new Date(),
        endDate: new Date(),
        status: 'open' as const
    });

    (periodRepository.closePeriodAndCreateNext as import('vitest').Mock).mockResolvedValue({
      ...mockPeriod,
      status: 'closed',
      closedAt: new Date()
    });

    const result = await useCase.execute('period-1');

    expect(periodRepository.findById).toHaveBeenCalledWith('period-1');
    expect(periodRepository.closePeriodAndCreateNext).toHaveBeenCalledWith('period-1', expect.any(Object));
    expect(result.status).toBe('closed');
  });

  it('should throw PeriodAlreadyClosedError if already closed (idempotency)', async () => {
    const mockPeriod: FinancialPeriod = {
      id: 'period-1',
      userId: 'user-1',
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-08-31T23:59:59Z'),
      status: 'closed',
      closedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    periodRepository.findById.mockResolvedValue(mockPeriod);

    await expect(useCase.execute('period-1')).rejects.toThrow(PeriodAlreadyClosedError);
    expect(periodRepository.update).not.toHaveBeenCalled();
    expect(financialPeriodService.createNextPeriod).not.toHaveBeenCalled();
  });

  it('should throw if period not found', async () => {
    periodRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('period-1')).rejects.toThrow('Period not found');
    expect(periodRepository.update).not.toHaveBeenCalled();
  });
});
