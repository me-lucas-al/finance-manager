import { describe, it, expect } from 'vitest';
import { NotificationFactory } from '../../../../modules/notifications/domain/NotificationFactory';
import { NotificationType } from '../../../../modules/notifications/domain/NotificationTypes';

describe('NotificationFactory', () => {
  it('should create an expense warning notification', () => {
    const notification = NotificationFactory.createExpenseWarning({ userId: '1', currentPercentage: 76 });
    expect(notification.type).toBe(NotificationType.EXPENSE_WARNING);
    expect(notification.message).toBe('Você já utilizou 76% da sua renda em gastos.');
  });

  it('should create an expense limit reached notification', () => {
    const notification = NotificationFactory.createExpenseLimitReached({ userId: '1', currentPercentage: 100, remainingAmount: 120 });
    expect(notification.type).toBe(NotificationType.EXPENSE_LIMIT_REACHED);
    expect(notification.message).toBe('Restam R$ 120.00 até atingir o limite configurado.');
  });

  it('should create an investment goal warning notification', () => {
    const notification = NotificationFactory.createInvestmentGoalWarning({ userId: '1', currentPercentage: 50, remainingAmount: 250 });
    expect(notification.type).toBe(NotificationType.INVESTMENT_GOAL_WARNING);
    expect(notification.message).toBe('Você ainda precisa investir R$ 250.00 para atingir o percentual configurado.');
  });

  it('should create a period closing reminder notification for tomorrow', () => {
    const notification = NotificationFactory.createPeriodClosingReminder({ userId: '1', currentPercentage: 0, daysRemaining: 1 });
    expect(notification.type).toBe(NotificationType.PERIOD_CLOSING_REMINDER);
    expect(notification.message).toBe('Seu período financeiro termina amanhã.');
  });

  it('should create a period closing reminder notification for multiple days', () => {
    const notification = NotificationFactory.createPeriodClosingReminder({ userId: '1', currentPercentage: 0, daysRemaining: 3 });
    expect(notification.type).toBe(NotificationType.PERIOD_CLOSING_REMINDER);
    expect(notification.message).toBe('Seu período financeiro termina em 3 dias.');
  });

  it('should create a period closed notification', () => {
    const notification = NotificationFactory.createPeriodClosed('1');
    expect(notification.type).toBe(NotificationType.PERIOD_CLOSED);
    expect(notification.message).toBe('O período foi fechado com sucesso.');
  });

  it('should create a new period notification', () => {
    const notification = NotificationFactory.createNewPeriod('1');
    expect(notification.type).toBe(NotificationType.NEW_PERIOD);
    expect(notification.message).toBe('Um novo período financeiro foi iniciado.');
  });
});
