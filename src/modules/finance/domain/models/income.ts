export type Income = {
  id: string;
  userId: string;
  periodId: string;
  description: string;
  amount: string;
  category: string;
  receivedAt: Date;
  externalId: string | null;
  fixedEntryId: string | null;
  fixedReferenceMonth: string | null;
  createdAt: Date;
  updatedAt: Date;
};
