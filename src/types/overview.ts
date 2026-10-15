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

export type {
  CreditCardOverview,
  CreditCardSummary,
} from '@/modules/finance/domain/models/credit-card-overview';

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
