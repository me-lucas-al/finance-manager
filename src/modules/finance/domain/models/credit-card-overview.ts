export type CreditCardSource = 'pluggy' | 'manual';

export type CreditCardSummary = {
  id: string;
  name: string;
  digits: string;
  amount: number;
  limit?: number;
  usedPercentage?: number;
};

export type CreditCardOverview = {
  source: CreditCardSource;
  total: number;
  usedPercentage: number;
  limit: number;
  cards: CreditCardSummary[];
};
