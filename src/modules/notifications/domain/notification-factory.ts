import { NotificationPayload, NotificationTriggerParams, NotificationType } from './NotificationTypes';

export class NotificationFactory {
  static createExpenseWarning(params: NotificationTriggerParams): NotificationPayload {
    return {
      userId: params.userId,
      type: NotificationType.EXPENSE_WARNING,
      title: 'Aviso de Gastos',
      message: `Você já utilizou ${params.currentPercentage}% da sua renda em gastos.`,
    };
  }

  static createExpenseLimitReached(params: NotificationTriggerParams): NotificationPayload {
    return {
      userId: params.userId,
      type: NotificationType.EXPENSE_LIMIT_REACHED,
      title: 'Limite de Gastos Atingido',
      message: `Restam R$ ${params.remainingAmount?.toFixed(2) ?? '0.00'} até atingir o limite configurado.`,
    };
  }

  static createInvestmentGoalWarning(params: NotificationTriggerParams): NotificationPayload {
    return {
      userId: params.userId,
      type: NotificationType.INVESTMENT_GOAL_WARNING,
      title: 'Meta de Investimento',
      message: `Você ainda precisa investir R$ ${params.remainingAmount?.toFixed(2) ?? '0.00'} para atingir o percentual configurado.`,
    };
  }

  static createPeriodClosingReminder(params: NotificationTriggerParams): NotificationPayload {
    const timeText = params.daysRemaining === 1 ? 'amanhã' : `em ${params.daysRemaining} dias`;
    return {
      userId: params.userId,
      type: NotificationType.PERIOD_CLOSING_REMINDER,
      title: 'Fechamento de Período',
      message: `Seu período financeiro termina ${timeText}.`,
    };
  }

  static createPeriodClosed(userId: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.PERIOD_CLOSED,
      title: 'Período Fechado',
      message: 'O período foi fechado com sucesso.',
    };
  }

  static createNewPeriod(userId: string): NotificationPayload {
    return {
      userId,
      type: NotificationType.NEW_PERIOD,
      title: 'Novo Período',
      message: 'Um novo período financeiro foi iniciado.',
    };
  }
}
