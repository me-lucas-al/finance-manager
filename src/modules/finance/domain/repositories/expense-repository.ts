export interface Expense {
  id: string;
  [key: string]: any;
}

export interface ExpenseRepository {
  create(data: Omit<Expense, 'id'>): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  update(id: string, data: Partial<Expense>): Promise<Expense>;
  delete(id: string): Promise<void>;
  
}