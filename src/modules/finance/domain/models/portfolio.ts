export type Holding = {
  id: string;
  name: string;
  type: string;
  balance: number;
};

export type AccountBalance = {
  id: string;
  bank: string;
  accountType: string;
  balance: number;
  creditLimit: number | null;
};

export type Portfolio = {
  holdings: Holding[];
  accounts: AccountBalance[];
  initialBalance: number;
};

export const EMPTY_PORTFOLIO: Portfolio = { holdings: [], accounts: [], initialBalance: 0 };
