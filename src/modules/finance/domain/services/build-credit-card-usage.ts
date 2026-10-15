import type { CardExpense, CreditCard, CreditCardUsage } from '../models/credit-card';
import { resolveBillingCycle } from './resolve-billing-cycle';

export function buildCreditCardUsage(card: CreditCard, expenses: CardExpense[], today: string): CreditCardUsage {
  const cycle = resolveBillingCycle(card.closingDay, today);
  const used = expenses
    .filter((expense) => expense.creditCardId === card.id && expense.date >= cycle.start && expense.date <= cycle.end)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const percentage = card.creditLimit > 0 ? Math.round((used / card.creditLimit) * 100) : 0;
  return { card, used, percentage, cycle };
}
