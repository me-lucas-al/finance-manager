import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FinancialPeriodService } from './FinancialPeriodService';
import { FinancialPeriod } from '../../domain/FinancialPeriod';

describe('FinancialPeriodService', () => {
  let service: FinancialPeriodService;
  let mockPeriodRepo: {
    findByExactDates: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let mockUserSettingsRepo: {
    getSettingsByUserId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPeriodRepo = {
      findByExactDates: vi.fn(),
      create: vi.fn(),
    };

    mockUserSettingsRepo = {
      getSettingsByUserId: vi.fn(),
    };

    service = new FinancialPeriodService(
      mockPeriodRepo as unknown as import('./FinancialPeriodService').IPeriodRepository,
      mockUserSettingsRepo as unknown as import('./FinancialPeriodService').IUserSettingsRepository
    );
  });

  describe('determinePeriodForDate', () => {
    it('should correctly determine period for the 14th of the month (before start day)', () => {
      // With startDay=15, endDay=14
      // Date: March 14, 2026 -> should belong to Feb 15 - Mar 14 period.
      const date = new Date(Date.UTC(2026, 2, 14, 12, 0, 0)); // Month is 0-indexed (2=March)
      const period = service.determinePeriodForDate(date, 15, 14);
      
      expect(period.year).toBe(2026);
      expect(period.month).toBe(2); // February (1-indexed)
      expect(period.startDate.toISOString()).toBe('2026-02-15T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-03-14T23:59:59.999Z');
    });

    it('should correctly determine period for the 15th of the month (on start day)', () => {
      // Date: March 15, 2026 -> should belong to Mar 15 - Apr 14 period.
      const date = new Date(Date.UTC(2026, 2, 15, 12, 0, 0)); 
      const period = service.determinePeriodForDate(date, 15, 14);
      
      expect(period.year).toBe(2026);
      expect(period.month).toBe(3); // March (1-indexed)
      expect(period.startDate.toISOString()).toBe('2026-03-15T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-04-14T23:59:59.999Z');
    });

    it('should correctly determine period for the 16th of the month (after start day)', () => {
      // Date: March 16, 2026 -> should belong to Mar 15 - Apr 14 period.
      const date = new Date(Date.UTC(2026, 2, 16, 12, 0, 0)); 
      const period = service.determinePeriodForDate(date, 15, 14);
      
      expect(period.year).toBe(2026);
      expect(period.month).toBe(3); 
      expect(period.startDate.toISOString()).toBe('2026-03-15T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-04-14T23:59:59.999Z');
    });

    it('should correctly determine period for the last day of the month', () => {
      // Date: March 31, 2026
      const date = new Date(Date.UTC(2026, 2, 31, 12, 0, 0)); 
      const period = service.determinePeriodForDate(date, 15, 14);
      
      expect(period.year).toBe(2026);
      expect(period.month).toBe(3); 
      expect(period.startDate.toISOString()).toBe('2026-03-15T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-04-14T23:59:59.999Z');
    });

    it('should correctly determine period for January (year crossover for previous year)', () => {
      // Date: January 10, 2026 -> belongs to Dec 15, 2025 - Jan 14, 2026
      const date = new Date(Date.UTC(2026, 0, 10, 12, 0, 0)); 
      const period = service.determinePeriodForDate(date, 15, 14);
      
      expect(period.year).toBe(2025);
      expect(period.month).toBe(12); // December
      expect(period.startDate.toISOString()).toBe('2025-12-15T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2026-01-14T23:59:59.999Z');
    });

    it('should correctly determine period for December (year crossover for next year)', () => {
      // Date: December 20, 2026 -> belongs to Dec 15, 2026 - Jan 14, 2027
      const date = new Date(Date.UTC(2026, 11, 20, 12, 0, 0)); 
      const period = service.determinePeriodForDate(date, 15, 14);
      
      expect(period.year).toBe(2026);
      expect(period.month).toBe(12); 
      expect(period.startDate.toISOString()).toBe('2026-12-15T00:00:00.000Z');
      expect(period.endDate.toISOString()).toBe('2027-01-14T23:59:59.999Z');
    });
  });

  describe('getCurrentPeriod', () => {
    it('should get or create the period for the current date based on user settings', async () => {
      const userId = 'user-123';
      const now = new Date(Date.UTC(2026, 2, 20)); // March 20, 2026
      
      mockUserSettingsRepo.getSettingsByUserId.mockResolvedValue({
        periodStartDay: 15,
        periodEndDay: 14,
      });

      mockPeriodRepo.findByExactDates.mockResolvedValue(null);
      mockPeriodRepo.create.mockResolvedValue({ id: 'period-123' });

      const result = await service.getOrCreatePeriodForDate(userId, now);

      expect(mockUserSettingsRepo.getSettingsByUserId).toHaveBeenCalledWith(userId);
      // Period should be March 15 to April 14
      expect(mockPeriodRepo.findByExactDates).toHaveBeenCalledWith(
        userId,
        new Date(Date.UTC(2026, 2, 15, 0, 0, 0, 0)),
        new Date(Date.UTC(2026, 3, 14, 23, 59, 59, 999))
      );
      expect(mockPeriodRepo.create).toHaveBeenCalledWith(
        userId,
        new Date(Date.UTC(2026, 2, 15, 0, 0, 0, 0)),
        new Date(Date.UTC(2026, 3, 14, 23, 59, 59, 999))
      );
      expect(result.id).toBe('period-123');
    });

    it('should not create a new period if it already exists', async () => {
      const userId = 'user-123';
      const now = new Date(Date.UTC(2026, 2, 20));
      
      mockUserSettingsRepo.getSettingsByUserId.mockResolvedValue({
        periodStartDay: 15,
        periodEndDay: 14,
      });

      mockPeriodRepo.findByExactDates.mockResolvedValue({ id: 'existing-period' });

      const result = await service.getOrCreatePeriodForDate(userId, now);

      expect(mockPeriodRepo.create).not.toHaveBeenCalled();
      expect(result.id).toBe('existing-period');
    });
  });

  describe('createNextPeriod', () => {
    it('should create the next period based on the current one', async () => {
      const userId = 'user-123';
      const currentDate = new Date(Date.UTC(2026, 2, 20)); // March 20 (Period: Mar 15 - Apr 14)

      mockUserSettingsRepo.getSettingsByUserId.mockResolvedValue({
        periodStartDay: 15,
        periodEndDay: 14,
      });

      mockPeriodRepo.findByExactDates.mockResolvedValue(null);
      mockPeriodRepo.create.mockResolvedValue({ id: 'next-period-id' });

      const result = await service.createNextPeriod(userId, currentDate);

      // Next period should be April 15 - May 14
      expect(mockPeriodRepo.findByExactDates).toHaveBeenCalledWith(
        userId,
        new Date(Date.UTC(2026, 3, 15, 0, 0, 0, 0)),
        new Date(Date.UTC(2026, 4, 14, 23, 59, 59, 999))
      );
      
      expect(mockPeriodRepo.create).toHaveBeenCalledWith(
        userId,
        new Date(Date.UTC(2026, 3, 15, 0, 0, 0, 0)),
        new Date(Date.UTC(2026, 4, 14, 23, 59, 59, 999))
      );
      expect(result.id).toBe('next-period-id');
    });

    it('should create the next period across year boundary', async () => {
      const userId = 'user-123';
      const currentDate = new Date(Date.UTC(2026, 11, 20)); // Dec 20 (Period: Dec 15 - Jan 14)

      mockUserSettingsRepo.getSettingsByUserId.mockResolvedValue({
        periodStartDay: 15,
        periodEndDay: 14,
      });

      mockPeriodRepo.findByExactDates.mockResolvedValue(null);
      mockPeriodRepo.create.mockResolvedValue({ id: 'next-period-id' });

      await service.createNextPeriod(userId, currentDate);

      // Next period should be Jan 15 - Feb 14 of 2027
      expect(mockPeriodRepo.create).toHaveBeenCalledWith(
        userId,
        new Date(Date.UTC(2027, 0, 15, 0, 0, 0, 0)),
        new Date(Date.UTC(2027, 1, 14, 23, 59, 59, 999))
      );
    });

    it('should not create if next period already exists', async () => {
      const userId = 'user-123';
      const currentDate = new Date(Date.UTC(2026, 2, 20)); // March 20

      mockUserSettingsRepo.getSettingsByUserId.mockResolvedValue({
        periodStartDay: 15,
        periodEndDay: 14,
      });

      mockPeriodRepo.findByExactDates.mockResolvedValue({ id: 'existing-next' });

      const result = await service.createNextPeriod(userId, currentDate);

      expect(mockPeriodRepo.create).not.toHaveBeenCalled();
      expect(result.id).toBe('existing-next');
    });
  });
});
