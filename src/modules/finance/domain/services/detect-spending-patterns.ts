import { SpendingAlert, SpendingPatternReport } from '../models/spending-patterns';
import { Transaction } from '@/modules/open-finance/domain/repositories/transaction-repository';

export type SpendingContext = {
  newAmount: number;
  category: string;
  recentTransactions: Transaction[];
  categoryLimit?: number | null;
  referenceMonth?: string;
};

export function detectSpendingPatterns(ctx: SpendingContext): SpendingPatternReport {
  const alerts: SpendingAlert[] = [];
  const catTxs = ctx.recentTransactions.filter(
    (t) => t.category?.toLowerCase() === ctx.category.toLowerCase()
  );

  const smallTxs = catTxs.filter((t) => t.amount <= 60);
  if (smallTxs.length >= 3 && ctx.newAmount <= 60) {
    const totalSmall = smallTxs.reduce((s, t) => s + t.amount, 0) + ctx.newAmount;
    alerts.push({
      type: 'repeated_small',
      category: ctx.category,
      message: `Gastos pequenos frequentes em ${ctx.category}: ${smallTxs.length + 1} lançamentos somando R$ ${totalSmall.toFixed(2)}.`,
      totalSpent: totalSmall,
    });
  }

  if (catTxs.length >= 3) {
    const avg = catTxs.reduce((s, t) => s + t.amount, 0) / catTxs.length;
    if (ctx.newAmount >= avg * 2 && avg > 20) {
      alerts.push({
        type: 'spike_above_average',
        category: ctx.category,
        message: `Pico de gasto em ${ctx.category}: R$ ${ctx.newAmount.toFixed(2)} está acima do dobro da média habitual (R$ ${avg.toFixed(2)}).`,
      });
    }
  }

  const matchingSameAmount = catTxs.filter((t) => Math.abs(t.amount - ctx.newAmount) < 0.01);
  if (matchingSameAmount.length >= 2) {
    alerts.push({
      type: 'subscription_like',
      category: ctx.category,
      message: `Padrão de recorrência detectado em ${ctx.category}: valor fixo de R$ ${ctx.newAmount.toFixed(2)}.`,
    });
  }

  if (ctx.categoryLimit && ctx.categoryLimit > 0) {
    const month = ctx.referenceMonth ?? new Date().toISOString().slice(0, 7);
    const monthTxs = catTxs.filter((t) => t.occurredAt.startsWith(month));
    const currentMonthTotal = monthTxs.reduce((s, t) => s + t.amount, 0) + ctx.newAmount;
    if (currentMonthTotal >= ctx.categoryLimit * 0.8) {
      const pct = Math.round((currentMonthTotal / ctx.categoryLimit) * 100);
      alerts.push({
        type: 'near_category_limit',
        category: ctx.category,
        message: `Atenção ao limite em ${ctx.category}: já atingiu ${pct}% do teto definido (R$ ${currentMonthTotal.toFixed(2)} de R$ ${ctx.categoryLimit.toFixed(2)}).`,
      });
    }
  }

  return { alerts, hasAlerts: alerts.length > 0 };
}
