import type { Investment } from '../models/investment';

export type { Investment };

export type InvestmentSortField = 'date' | 'description' | 'amount';

export type InvestmentQuery = {
  search?: string;
  type?: string;
  sort?: InvestmentSortField;
  dir?: 'asc' | 'desc';
  limit: number;
  offset: number;
};

export type InvestmentPage = { rows: Investment[]; total: number };

export type NewInvestment = {
  id?: string;
  userId: string;
  periodId: string;
  description: string;
  amount: number | string;
  type: string;
  date: Date;
  referenceMonth?: string;
};

export type InvestmentUpdate = Partial<Pick<NewInvestment, 'description' | 'amount' | 'type' | 'date'>>;

export interface InvestmentRepository {
  create(data: NewInvestment): Promise<Investment>;
  findById(id: string): Promise<Investment | null>;
  update(id: string, data: InvestmentUpdate): Promise<Investment>;
  findLatestByUserId(userId: string): Promise<Investment | null>;
  delete(id: string): Promise<void>;
  findPageByUserId(userId: string, query: InvestmentQuery): Promise<InvestmentPage>;
}
