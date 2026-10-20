import type { Income } from '../models/income';

export type { Income };

export type IncomeSortField = 'date' | 'description' | 'amount';

export type IncomeQuery = {
  search?: string;
  category?: string;
  sort?: IncomeSortField;
  dir?: 'asc' | 'desc';
  limit: number;
  offset: number;
};

export type IncomePage = { rows: Income[]; total: number };

export type NewIncome = {
  id?: string;
  userId: string;
  periodId: string;
  description: string;
  amount: number | string;
  category: string;
  receivedAt: Date;
  fixedEntryId?: string;
  fixedReferenceMonth?: string;
  referenceMonth?: string;
};

export type IncomeUpdate = Partial<Pick<NewIncome, 'description' | 'amount' | 'category' | 'receivedAt'>>;

export interface IncomeRepository {
  create(data: NewIncome): Promise<Income>;
  findById(id: string): Promise<Income | null>;
  update(id: string, data: IncomeUpdate): Promise<Income>;
  findLatestEditableByUserId(userId: string): Promise<Income | null>;
  delete(id: string): Promise<void>;
  findPageByUserId(userId: string, query: IncomeQuery): Promise<IncomePage>;
}
