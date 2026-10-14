export interface BankAccountSummary {
  id: string;
  bank: string;
  name: string;
  countText: string;
  amount: number;
}

export interface BankOverview {
  total: number;
  accounts: BankAccountSummary[];
}

export interface CreditCardSummary {
  id: string;
  name: string;
  digits: string;
  amount: number;
}

export interface CreditCardOverview {
  total: number;
  usedPercentage: number;
  limit: number;
  cards: CreditCardSummary[];
}

export interface InvestmentInstitution {
  name: string;
  count: number;
  amount: number;
}

export interface InvestmentOverview {
  total: number;
  count: number;
  subtitle: string;
  categoryName: string;
  percentage: number;
  institutions?: InvestmentInstitution[];
}

export interface BalancePoint {
  date: string;
  value: number;
}
