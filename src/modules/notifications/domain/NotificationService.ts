import { Notification } from './Notification';
import { NotificationType } from './types';
import { FinancialMetrics } from '../../finance/domain/FinancialMetrics';
import { FinancialPeriod } from '../../finance/domain/FinancialPeriod';

export class NotificationService {
  constructor(private readonly generateId: () => string) {}

  generateFromMetrics(metrics: FinancialMetrics): Notification[] {
    const notifications: Notification[] = [];
    const { expensePercentage, investmentPercentage, config } = metrics;
    const { maxExpensePercentage, minInvestmentPercentage } = config.distributionRule;

    const expenseWarningThreshold = maxExpensePercentage * 0.9; // 90% of max

    if (expensePercentage >= maxExpensePercentage) {
      notifications.push(
        new Notification({
          id: this.generateId(),
          type: NotificationType.EXPENSE_LIMIT_REACHED,
          title: 'Limite de Despesas Atingido',
          message: `Suas despesas atingiram ${expensePercentage.toFixed(1)}%, ultrapassando o limite de ${maxExpensePercentage}%.`,
          metadata: { expensePercentage, maxExpensePercentage }
        })
      );
    } else if (expensePercentage >= expenseWarningThreshold) {
      notifications.push(
        new Notification({
          id: this.generateId(),
          type: NotificationType.EXPENSE_WARNING,
          title: 'Aviso de Despesas',
          message: `Suas despesas estão em ${expensePercentage.toFixed(1)}%, próximas ao limite de ${maxExpensePercentage}%.`,
          metadata: { expensePercentage, maxExpensePercentage, expenseWarningThreshold }
        })
      );
    }

    if (investmentPercentage < minInvestmentPercentage && metrics.totalIncome > 0) {
      notifications.push(
        new Notification({
          id: this.generateId(),
          type: NotificationType.INVESTMENT_GOAL_WARNING,
          title: 'Aviso de Meta de Investimento',
          message: `Seus investimentos estão em ${investmentPercentage.toFixed(1)}%, abaixo da meta de ${minInvestmentPercentage}%.`,
          metadata: { investmentPercentage, minInvestmentPercentage }
        })
      );
    }

    return notifications;
  }

  generateForPeriod(period: FinancialPeriod, currentDate: Date): Notification[] {
    const notifications: Notification[] = [];
    
    // Calculate differences
    const startStartOfDay = new Date(period.startDate);
    startStartOfDay.setUTCHours(0, 0, 0, 0);

    const endEndOfDay = new Date(period.endDate);
    endEndOfDay.setUTCHours(23, 59, 59, 999);
    
    const currentStartOfDay = new Date(currentDate);
    currentStartOfDay.setUTCHours(0, 0, 0, 0);
    
    const currentDayTime = currentStartOfDay.getTime();
    const startTime = startStartOfDay.getTime();

    // Exactly start date
    if (currentDayTime === startTime) {
      notifications.push(
        new Notification({
          id: this.generateId(),
          type: NotificationType.NEW_PERIOD,
          title: 'Novo Período',
          message: 'Um novo período financeiro começou. Revise suas metas!',
          metadata: { periodStart: period.startDate, periodEnd: period.endDate }
        })
      );
    }

    // Exactly end date (using day comparison)
    const endStartOfDayTime = new Date(period.endDate);
    endStartOfDayTime.setUTCHours(0, 0, 0, 0);
    if (currentDayTime === endStartOfDayTime.getTime()) {
      notifications.push(
        new Notification({
          id: this.generateId(),
          type: NotificationType.PERIOD_CLOSED,
          title: 'Fim do Período',
          message: 'O período atual terminou. Fechamento de mês!',
          metadata: { periodEnd: period.endDate }
        })
      );
    } else if (currentDayTime < endStartOfDayTime.getTime()) {
      // Check if it's within 3 days before end
      const diffTime = endStartOfDayTime.getTime() - currentDayTime;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays > 0 && diffDays <= 3) {
        notifications.push(
          new Notification({
            id: this.generateId(),
            type: NotificationType.PERIOD_CLOSING_REMINDER,
            title: 'Fechamento Próximo',
            message: `O período atual terminará em ${Math.ceil(diffDays)} dias.`,
            metadata: { daysRemaining: Math.ceil(diffDays), periodEnd: period.endDate }
          })
        );
      }
    }

    return notifications;
  }
}
