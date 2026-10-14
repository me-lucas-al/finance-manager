type EntryBase = {
  userId: string;
  periodId: string;
  externalId: string;
  amount: number;
  description: string;
};

export interface LedgerWriter {
  addIncome(data: EntryBase & { category: string; receivedAt: Date }): Promise<boolean>;
  addInvestment(data: EntryBase & { type: string; date: Date }): Promise<boolean>;
  upsertHolding(data: EntryBase & { type: string; date: Date }): Promise<void>;
}
