export enum NotificationType {
  EXPENSE_WARNING = 'EXPENSE_WARNING',
  EXPENSE_LIMIT_REACHED = 'EXPENSE_LIMIT_REACHED',
  INVESTMENT_GOAL_WARNING = 'INVESTMENT_GOAL_WARNING',
  PERIOD_CLOSING_REMINDER = 'PERIOD_CLOSING_REMINDER',
  PERIOD_CLOSED = 'PERIOD_CLOSED',
  NEW_PERIOD = 'NEW_PERIOD',
  GENERAL = 'GENERAL',
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotificationTriggerParams {
  userId: string;
  currentPercentage: number;
  targetPercentage?: number;
  remainingAmount?: number;
  daysRemaining?: number;
}
