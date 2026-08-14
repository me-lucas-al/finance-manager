import { describe, it, expect } from 'vitest';
import { NotificationType } from './types';
import { NotificationService } from './NotificationService';
import { FinancialMetrics } from '../../finance/domain/FinancialMetrics';
import { FinancialPeriod } from '../../finance/domain/FinancialPeriod';
import { Income } from '../../finance/domain/Income';
import { Expense } from '../../finance/domain/Expense';
import { Investment } from '../../finance/domain/Investment';
import { UserConfig } from '../../finance/domain/UserConfig';
import { DistributionRule } from '../../finance/domain/DistributionRule';

describe('NotificationService', () => {
  const generateId = () => 'test-id';
  const service = new NotificationService(generateId);

  const createMetrics = (incomes: Income[], expenses: Expense[], investments: Investment[]) => {
    const period = new FinancialPeriod(1, 31, 2026, 8);
    const config = new UserConfig(new DistributionRule(80, 20));
    return new FinancialMetrics(period, incomes, expenses, investments, config);
  };

  describe('generateFromMetrics', () => {
    it('should not generate notifications when finances are healthy', () => {
      const incomes = [new Income('1', 'Salary', 1000, new Date('2026-08-10'))];
      const expenses = [new Expense('2', 'Rent', 500, new Date('2026-08-15'))]; // 50%
      const investments = [new Investment('3', 'Stocks', 300, new Date('2026-08-20'))]; // 30%

      const metrics = createMetrics(incomes, expenses, investments);
      const notifications = service.generateFromMetrics(metrics);

      expect(notifications).toHaveLength(0);
    });

    it('should generate EXPENSE_WARNING when expenses are close to the limit', () => {
      const incomes = [new Income('1', 'Salary', 1000, new Date('2026-08-10'))];
      const expenses = [new Expense('2', 'Rent', 760, new Date('2026-08-15'))]; // 76% (limit 80)
      const investments = [new Investment('3', 'Stocks', 200, new Date('2026-08-20'))]; // 20%

      const metrics = createMetrics(incomes, expenses, investments);
      const notifications = service.generateFromMetrics(metrics);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.EXPENSE_WARNING);
    });

    it('should generate EXPENSE_LIMIT_REACHED when expenses exceed the limit', () => {
      const incomes = [new Income('1', 'Salary', 1000, new Date('2026-08-10'))];
      const expenses = [new Expense('2', 'Rent', 850, new Date('2026-08-15'))]; // 85%
      const investments = [new Investment('3', 'Stocks', 100, new Date('2026-08-20'))]; // 10%

      const metrics = createMetrics(incomes, expenses, investments);
      const notifications = service.generateFromMetrics(metrics);

      expect(notifications.some(n => n.type === NotificationType.EXPENSE_LIMIT_REACHED)).toBe(true);
      expect(notifications.some(n => n.type === NotificationType.INVESTMENT_GOAL_WARNING)).toBe(true);
    });

    it('should generate INVESTMENT_GOAL_WARNING when investments are below minimum', () => {
      const incomes = [new Income('1', 'Salary', 1000, new Date('2026-08-10'))];
      const expenses = [new Expense('2', 'Rent', 500, new Date('2026-08-15'))]; // 50%
      const investments = [new Investment('3', 'Stocks', 150, new Date('2026-08-20'))]; // 15%

      const metrics = createMetrics(incomes, expenses, investments);
      const notifications = service.generateFromMetrics(metrics);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.INVESTMENT_GOAL_WARNING);
    });
  });

  describe('generateForPeriod', () => {
    it('should generate NEW_PERIOD when current date is the start date', () => {
      const period = new FinancialPeriod(1, 31, 2026, 8);
      const startDate = period.startDate;
      const notifications = service.generateForPeriod(period, startDate);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.NEW_PERIOD);
    });

    it('should generate PERIOD_CLOSING_REMINDER when within 3 days of end date', () => {
      const period = new FinancialPeriod(1, 31, 2026, 8);
      const reminderDate = new Date(period.endDate.getTime() - 2 * 24 * 60 * 60 * 1000);
      const notifications = service.generateForPeriod(period, reminderDate);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.PERIOD_CLOSING_REMINDER);
    });

    it('should generate PERIOD_CLOSED when exactly end date', () => {
      const period = new FinancialPeriod(1, 31, 2026, 8);
      const endDate = period.endDate;
      const notifications = service.generateForPeriod(period, endDate);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.PERIOD_CLOSED);
    });
    
    it('should not generate period notifications for dates in the middle', () => {
      const period = new FinancialPeriod(1, 31, 2026, 8);
      const middleDate = new Date(period.startDate.getTime() + 10 * 24 * 60 * 60 * 1000);
      const notifications = service.generateForPeriod(period, middleDate);

      expect(notifications).toHaveLength(0);
    });
  });
});
