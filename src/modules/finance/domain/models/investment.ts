export type Investment = {
  id: string;
  userId: string;
  periodId: string;
  description: string;
  amount: string;
  type: string;
  date: Date;
  externalId: string | null;
  referenceMonth: string | null;
  createdAt: Date;
  updatedAt: Date;
};
