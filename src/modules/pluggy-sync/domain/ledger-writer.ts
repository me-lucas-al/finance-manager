type EntryBase = {
  userId: string;
  periodId: string;
  externalId: string;
  amount: number;
  description: string;
};

export type HoldingInput = {
  userId: string;
  itemId: string;
  externalId: string;
  name: string;
  type: string;
  balance: number;
};

export interface LedgerWriter {
  addIncome(data: EntryBase & { category: string; receivedAt: Date }): Promise<boolean>;
  addInvestment(data: EntryBase & { type: string; date: Date }): Promise<boolean>;
  replaceItemHoldings(userId: string, itemId: string, holdings: HoldingInput[]): Promise<void>;
}
