export type CreditCard = {
  id: string;
  userId: string;
  name: string;
  lastDigits: string | null;
  creditLimit: number;
  closingDay: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewCreditCardInput = {
  name: string;
  lastDigits?: string | null;
  creditLimit: number;
  closingDay?: number | null;
};

export type CreditCardChanges = Partial<NewCreditCardInput>;

export type BillingCycle = { start: string; end: string };

export type CreditCardUsage = {
  card: CreditCard;
  used: number;
  percentage: number;
  cycle: BillingCycle;
};

export type CardExpense = { creditCardId: string; amount: number; date: string };
