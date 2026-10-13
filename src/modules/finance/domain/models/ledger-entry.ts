export type LedgerKind = 'expense' | 'income' | 'investment';

export type LedgerEntry = {
  id: string;
  kind: LedgerKind;
  date: string;
  description: string;
  category: string;
  amount: number;
  account: string;
};
