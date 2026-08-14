import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('../../../../modules/periods/infra/repositories/PeriodDrizzleRepository', () => {
  return {
    PeriodDrizzleRepository: vi.fn().mockImplementation(function() {
      return {
        findEndedOpenPeriods: vi.fn().mockResolvedValue([]),
      };
    }),
  };
});

vi.mock('../../../../modules/periods/application/useCases/ClosePeriodUseCase', () => {
  return {
    ClosePeriodUseCase: vi.fn().mockImplementation(function() {
      return {
        execute: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

vi.mock('../../../../modules/users/infra/repositories/UserSettingsDrizzleRepository', () => {
  return {
    UserSettingsDrizzleRepository: vi.fn().mockImplementation(function() {
      return {
        findByUserId: vi.fn().mockResolvedValue({ periodStartDay: 1, periodEndDay: 30 }),
      };
    }),
  };
});

describe('GET /api/cron/close-periods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
  });

  it('should return 401 if unauthorized', async () => {
    const req = new Request('http://localhost/api/cron/close-periods', {
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return success and close periods if authorized', async () => {
    const { PeriodDrizzleRepository } = await import('../../../../modules/periods/infra/repositories/PeriodDrizzleRepository');
    const { ClosePeriodUseCase } = await import('../../../../modules/periods/application/useCases/ClosePeriodUseCase');
    
    // Mocking findEndedOpenPeriods to return some periods
    (PeriodDrizzleRepository as import('vitest').Mock).mockImplementationOnce(function() {
      return {
        findEndedOpenPeriods: vi.fn().mockResolvedValue([{ id: 'period-1' }, { id: 'period-2' }]),
        findByExactDates: vi.fn(),
        create: vi.fn(),
      };
    });

    const mockExecute = vi.fn().mockResolvedValue({});
    (ClosePeriodUseCase as import('vitest').Mock).mockImplementationOnce(function() {
      return { execute: mockExecute };
    });

    const req = new Request('http://localhost/api/cron/close-periods', {
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.processed).toBe(2);
    expect(json.closed).toBe(2);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});
